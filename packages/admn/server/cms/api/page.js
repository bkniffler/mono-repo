var multi = require('powr/multi-bind');
var unflatten = require('../../../utils/unflatten');
var flatten = require('../../../utils/flatten');
var lodash = require('lodash');
var draftTemplate = require('../draft-js-templates');

var getSortProperty = item => item.order || item.name || item.updatedAt || item.id;
var getSlug = item => item.name.toLowerCase().split(' ').join('_');

module.exports = function (app, base) {
  var Page = app.db.model('page');
  var singleAndPlural = multi([base + '/page', base + '/pages']);

  var getNavigation = () => Page.findAll({
    attributes: ['id', 'name', 'parent', 'revision', 'slug', 'order', 'menu', 'placeholder', 'boundTo', 'boundQuery']
  }).then(pages => {
    var promises = [];
    pages = pages.map(page => page.toJSON());
    // Iterate bound pages (like 'person') => [ page1, page2 ] that are not boundTo parent.xyz
    pages.filter(page => page.boundTo && page.boundTo.indexOf('.') === -1).forEach(page => {
      var query = Object.assign({ include: [{all: true}] }, page.boundQuery || {});
      // Get bound lists items (like 'rolle') => [ rolle1, rolle2 ] with related (rolle.personen)
      var promise = app.db.model(page.boundTo).findAll(query).then(items => {
        // Iterate bound items, add new page for each
        items.forEach(item => {
          var newPage = {
            id: page.id + '(' + item.id + ')',
            name: item.name,
            boundObject: item,
            parent: page.parent,
            computed: true,
            slug: page.parent + '/' + getSlug(item),
          };
          pages.push(newPage);

          // Iterate bound sub pages ('rolle' -> ['person'])
          pages.filter(c => c.parent === page.slug && c.boundTo && c.boundTo.indexOf('parent.') === 0).forEach(page => {
            // If bound to parent (e.g. 'person'-page bound to 'parent.personen' of parent boundObject)
            var field = page.boundTo.split('.')[1];
            var items = newPage.boundObject[field] || [];
            // Save sorted in newPage, create new page for each child
            newPage.boundObject[field] = lodash.sortBy(items, getSortProperty).map(item => {
              pages.push({
                id: page.id + '(' + item.id + ')',
                name: item.name,
                boundObject: item,
                parent: newPage.slug,
                computed: true,
                slug: newPage.slug + '/' + getSlug(item),
              });
              return item;
            });
          });
        });
      })
      promises.push(promise);
    });

    return Promise.all(promises).then(() => Promise.resolve(pages));
  }).then(pages => {
    var pagesAsTree = {};
    pages.forEach(page => {
      var group = page.menu || 'main';
      if (!pagesAsTree[group]) {
        pagesAsTree[group] = [];
      }
      pagesAsTree[group].push(page);
    });

    Object.keys(pagesAsTree).forEach(key => {
      pagesAsTree[key] = unflatten(pagesAsTree[key], {parentId: 'parent', id: 'slug'});
    });

    return {
      flat: pages,
      tree: pagesAsTree,
    };
  });

  // ******************************* Get ***************************//
  /**
   * Get all : /page(s)
   * @param {object} query: Sequelize query /page(s)?query={"where": {x: 1}}
   */
  app.get(singleAndPlural(), function (req, res, next) {
    req.query.include = [{model: app.db.model('template'), as: 'template'}];
    var item;
    getNavigation().then(function (data) {
      item = data.flat.filter(function (item) {
        return item.slug === req.query.slug;
      })[0];
      if (!item) throw Error('Not found by slug ' + req.query.slug);
      return Page.findById(item.id.indexOf('(') !== -1 ? item.id.split('(')[0] : item.id);
    }).then(function (page) {
      var pageJson = page.toJSON();
      if (item.computed) {
        pageJson.id = item.id;
        pageJson.computed = true;
        pageJson.blocks = draftTemplate(pageJson.blocks, item.boundObject);
      }
      res.json(pageJson);
    }).catch(next);
  });

  /**
   * Get : /page(s)/navigation
   * Navigation Tree
   * @param {object} query: Sequelize query /page(s)?query={"where": {x: 1}}
   */
  app.get(singleAndPlural('/navigation'), function (req, res, next) {
    getNavigation().then(function (data) {
      res.json(data.tree);
    }).catch(next);
  });

  /**
   * Get : /page(s)/navigation
   * Navigation Tree
   */
  app.get(singleAndPlural('/:id'), function (req, res, next) {
    var id = req.params.id;
    var where = {};
    if (id.length === 36 && id.split('-').length === 5) {
      where.id = id;
    } else {
      where.ref = id;
    }
    Page.findOne({where: where}, {include: [{model: app.db.model('template'), as: 'template'}]}).then(function (data) {
      res.json(data);
    }).catch(next);
  });

  // ******************************* Put ***************************//
  /**
   * Put : /page(s)/navigation
   * Update Navigation Tree
   */
  app.put(singleAndPlural('/navigation'), app.isAuthenticated, function (req, res, next) {
    updateNavigation(Page, req, req.body, function (items) {
      res.json(items);
    }, next);
  });

  /**
   * Put : /page(s)/:id
   * Update page
   */
  app.put(singleAndPlural('/:id'), app.isAuthenticated, function (req, res, next) {
    if (req.params.id.indexOf('(') !== -1) return next();
    var id = req.params.id;

    Page.findById(id, {paranoid: false}).then(function (item) {
      if (!item) {
        return next(new Error('Page with id ' + id + ' not found'));
      }
      item.updateAttributes(req.body).then(function (item) {
        Page.findAll().then(function (items) {
          updateNavigation(Page, req, unflatten(items.map(function (item) {
            return item.toJSON();
          }), {parentId: 'parent', id: 'slug'}), function (items) {
            Page.findById(id, {
              include: [{model: app.db.model('template'), as: 'template'}],
              paranoid: false
            }).then(function (item) {
              res.json(item);
            }).catch(next);
          }, next);
        }).catch(next);

      }).catch(next);
    }).catch(next);
  });

  // ******************************* Post ***************************//
  /**
   * Post : /page(s)
   * New page
   */
  app.post(singleAndPlural(), app.isAuthenticated, function (req, res, next) {
    var page = Page.build(req.body);
    page.save().then(function (item) {
      Page.findAll().then(function (items) {
        updateNavigation(Page, req, unflatten(items.map(function (item) {
          return item.toJSON();
        }), {parentId: 'parent', id: 'slug'}), function (items) {
          Page.findById(item.id, {
            include: [{model: app.db.model('template'), as: 'template'}],
            paranoid: false
          }).then(function (item) {
            res.json(item);
          }).catch(next);
        }, next);
      }).catch(next);
    }).catch(next);
  });

  // ******************************* Delete ***************************//
  /**
   * Delete : /page(s)/:id
   * Delete page
   */
  app.delete(singleAndPlural('/:id'), app.isAuthenticated, function (req, res, next) {
    var id = req.params.id;
    Page.findById(id).then(function (item) {
      item.destroy().then(function (x) {
        res.json(item);
      }).catch(next);
    }).catch(next);
  });
};

function updateNavigation(Page, req, body, next, err) {
  // Update slugs
  function updateSlug(node, parentSlug, parentMenu) {
    var split = node.slug ? node.slug.split('/') : [''];
    var slug = split[split.length - 1];
    if (!slug || slug === '') {
      slug = '/';
    }
    if (slug[0] !== '/') {
      slug = '/' + slug;
    }
    if (slug === '/') {
      slug = '/' + node.name.split(' ').join('-').toLowerCase();
    }

    if (parentMenu) {
      node.menu = parentMenu;
    }
    node.slug = parentSlug + slug;
    node.children = node.children.map(function (n) {
      return updateSlug(n, node.slug, node.menu);
    });
    return node;
  }

  body = body.map(function (node) {
    return updateSlug(node, '');
  });

  var list = flatten(body, {parentId: 'parent', id: 'slug'}).filter(function (item) {
    return item.id.indexOf('(') === -1;
  });
  // Collect updates for all
  list = list.map(function (x) {
    return new Promise(function (res, rej) {
      Page.findById(x.id, {paranoid: false}).then(function (item) {
        item.updateAttributes(x).then(function (item) {
          res(item);
        }).catch(rej);
      }).catch(rej);
    });
  });
  // Return new tree
  Promise.all(list).then(function (items) {
    Page.findAll({attributes: ['id', 'name', 'parent', 'revision', 'slug', 'order', 'menu']}).then(function (items) {
      var _items = {};
      items.forEach(function (item) {
        var group = item.menu || 'main';
        if (!_items[group]) {
          _items[group] = [];
        }
        _items[group].push(item.toJSON());
      });

      Object.keys(_items).forEach(function (key) {
        _items[key] = unflatten(_items[key], {parentId: 'parent', id: 'slug'});
      });
      next(_items);
    }).catch(err);
  }).catch(err);
}
