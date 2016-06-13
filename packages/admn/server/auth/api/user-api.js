var constants = require('../constants');

module.exports = function (app) {
  // Get: Get by username
  app.get('/api/user/username/:username', app.isAuthenticated, (req, res, next) => {
    User.findOne({where: {username: req.params.username, deletedAt: null}}).then(user => {
      if (!user) {
        next(new ClientError(constants.USER_NOT_FOUND));
      } else {
        res.json(user);
      }
    }).catch(next);
  });

  // Get: Get by id
  app.get('/api/user/:id', app.isAuthenticated, (req, res, next) => {
    User.findById(req.params.id).then(function (user) {
      if (!user) {
        next(new ClientError(constants.USER_NOT_FOUND));
      } else {
        res.json(user);
      }
    }).catch(next);
  });

  // Get: Get all
  app.get('/api/users', app.isAuthenticated, (req, res, next) => {
    if (!req.user.isAdmin) {
      next(new ClientError(constants.NO_PERMISSIONS));
    } else {
      User.findAll({oder: ["name", "ASC"]}).then(users => {
        res.json(users);
      }).catch(next);
    }
  });

  // Put: Update by id
  app.put('/api/user/:id', app.isAuthenticated, (req, res, next) => {
    var id = req.params.id;
    var password = req.body.password;
    delete req.body.password;

    // Nur Admin oder man selber kann Daten ändern
    if (!req.user.isAdmin && req.user.id !== req.body.id) {
      next(new ClientError(constants.NO_PERMISSIONS));
    } else {
      // Admin kann sich selber nicht Adminrechte nehmen und deaktivieren
      if (!req.user.isAdmin || req.user.id === req.body.id) {
        delete req.body.isAdmin;
      }
      User.findById(id).then(user => {
        if (!user) {
          throw new ClientError(constants.USER_NOT_FOUND);
        } else if (password) {
          return new Promise((resolve, reject) => {
            user.setPassword(password, (err, user) => {
              if (err) {
                reject(err);
              }
              user.save().then(user => resolve(user)).catch(err=>reject(err));
            });
          });
        } return user;
      }).then(user => user.update(req.body))
        .then(user => res.json(user))
        .catch(err => next(err));
    }
  });
}
