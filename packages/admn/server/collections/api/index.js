module.exports = function (app, base) {
  var model = app.db.model('model');

  app.get('/api/collection', function (req, res, next) {
    model.findAll(req.query).then(function (items) {
      res.json(items.map(function (item) {
        return Object.assign(item.json, {id: item.id});
      }));
    }).catch(function (err) {
      next(err);
    });
  });
  app.get('/api/collection/:id', function (req, res, next) {
    model.findById(req.params.id).then(function (item) {
      res.json(Object.assign(item.get('json'), {id: item.get('id')}));
    }).catch(function (err) {
      next(err);
    });
  });
  app.post('/api/collection', function (req, res, next) {
    model.create({id: key, json: req.body}).then(function (item) {
      res.json(Object.assign(item.get('json'), {id: item.get('id')}));
    }).catch(function (err) {
      next(err);
    });
  });
  app.put('/api/collection/:id', function (req, res, next) {
    model.findById(req.params.id).then(function (item) {
      if (!item) {
        return next(new Error('Item with id ' + req.params.id + ' not found'));
      }
      item.updateAttributes({json: extend(item.get('json'), req.body)}).then(function (item) {
        res.json(Object.assign(item.get('json'), {id: item.get('id')}));
      }).catch(next);
    }).catch(next);
  });

  function handler(req, res, next) {
    var method = req.method.toLowerCase();

    var modelItem = app.db.models[req.params.model];
    if (modelItem && app.getCollection(req.params.model)) {
      if (req.body && req.body.id) {
        delete req.body.id;
      }

      if (method === 'get' && req.params.id) {
        modelItem.findById(req.params.id, {
          include: [{all: true}],
        }).then(function (item) {
          if (!item) {
            return next(new Error('Not found'));
          }
          res.json(item);
        }).catch(next);
      } else if ((method === 'del' || method === 'delete') && req.params.id) {
        modelItem.findById(req.params.id).then(function (item) {
          if (!item) {
            return next(new Error('Item with id ' + req.params.id + ' not found'));
          }
          return item.destroy().then(x => res.json(item));
        }).catch(next);
      } else if (method === 'get') {
        req.query.include = [{all: true, required: false}];
        modelItem.findAll(req.query)
          .then(item => res.json(item))
          .catch(err => next(err));
      } else if ((method === 'post' || method === 'post') && !req.params.id) {
        updateWithRelated(modelItem, req.body)
          .then(item => res.json(item))
          .catch(err => next(err));
      } else if ((method === 'put' || method === 'put') && req.params.id) {
        req.body.id = req.params.id;
        updateWithRelated(modelItem, req.body)
          .then(item => res.json(item))
          .catch(err => next(err));
      }
    }
    else {
      next();
    }
  }

  app.get('/api/:model/suggestions/:field', (req, res, next) => {
    var field = req.params.field;
    var model = app.db.models[req.params.model];

    // Find all, get only [field] attribute
    model.findAll({attributes: [field]}).then(result => {
      var values = [];
      result.forEach(item => {
          Array.isArray(item) ? values.concat(item) : values.push(item)
        }
      );

      // Map over [field]
      res.json(values)
    }).catch(err => next(err));
  });

  app.all('/api/:model/:id', handler);
  app.all('/api/:model', handler);
  // Base.autoBind(app, base, 'termin', 'termine');
};

function updateWithRelated(model, newItem) {
  var promises = [];

  for (var key in model.associations) {
    var association = model.associations[key];
    if (association.associationType === 'BelongsTo') {
      var setterMethod = 'set' + capitalizeFirstLetter(association.as);
      var id = newItem[association.as] ? newItem[association.as].id : null;
      newItem[association.as + 'Id'] = id;
      promises.push(item => item[setterMethod](id));
      // save changes to newItem[association.as]
      delete newItem[association.as];
    }
    else if (association.associationType === 'BelongsToMany' || association.associationType === 'HasMany') {
      if (Array.isArray(newItem[association.as])) {
        var ids = newItem[association.as + 'Ids'] = newItem[association.as].map(item => item.id);
        var capitalized = capitalizeFirstLetter(association.as);
        promises.push(
          item => item['get' + capitalized]()
            .then(items => item['remove' + capitalized](items))
            .then(() => item['add' + capitalized](ids))
        );
      }
      delete newItem[association.as];
      delete newItem[association.as + 'Ids'];
    }
  }

  var isNew = !newItem.id;
  // New or Update?
  var method = newItem.id ? model.findOne({where: {id: newItem.id}, paranoid: false}).then(item => {
    item.setDataValue('deletedAt', null);
    return item.update(newItem);
  }) : model.create(newItem);

  return method
    .then(item => Promise.all(promises.map(promise => promise(item))).then(() => item))
    .then(item => model.findOne({where: {id: item.id}, include: [{all: true, required: false}], paranoid: false}));
}

function capitalizeFirstLetter(text) {
  if (!text) return '';
  return text[0].toUpperCase() + text.substr(1);
}
