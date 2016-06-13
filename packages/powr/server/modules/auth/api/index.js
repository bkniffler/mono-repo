var multi = require("../../../utils/multi-bind");
var Token = require("../../../core/api-token");

var NO_USER = 'NO_USER';
var NO_PERMISSIONS = 'NO_PERMISSIONS';

var USER_NOT_FOUND = 'USER_NOT_FOUND';
var USER_NOT_ACTIVE = 'USER_NOT_ACTIVE';

var NAME_REQUIRED = 'NAME_REQUIRED';
var EMAIL_REQUIRED = 'EMAIL_REQUIRED';
var PASSWORD_REQUIRED = 'PASSWORD_REQUIRED';

var WRONG_KEY = 'WRONG_KEY';

module.exports = function (app, base) {
   var User = app.db.model("user");
   var singleAndPlural = multi([base + "/user", base + "/users"]);

   // Get: Logout
   app.get(singleAndPlural("/logout"), app.isAuthenticated, function (req, res, next) {
      req.session.destroy();
      res.json({})
   });

   // Get: Get me
   app.get(singleAndPlural("/me"), app.isAuthenticated, function (req, res, next) {
      var user = req.user;
      if (!user) {
         return next(new Error(NO_USER));
      }
      res.json(user);
   });

   // Get: Get by username
   app.get(singleAndPlural("/username/:username"), app.isAuthenticated, function (req, res, next) {
      var username = req.params.username;

      User.findOne({where: {username: username, deletedAt: null}}).then(function (user) {
         if (!user) {
            return next(new Error(USER_NOT_FOUND));
         }
         res.json(user);
      }).catch(next);
   });

   // Get: Get by id
   app.get(singleAndPlural("/:id"), app.isAuthenticated, function (req, res, next) {
      var id = req.params.id;

      User.findById(id).then(function (user) {
         if (!user) {
            return next(new Error(USER_NOT_FOUND));
         }
         res.json(user);
      }).catch(next);
   });

   // Get: Get all
   app.get(singleAndPlural(), app.isAuthenticated, function (req, res, next) {
      /*if (!req.user.isAdmin) {
       return next(new Error(NO_PERMISSIONS));
       }*/

      var where = {deletedAt: null};
      if (!req.user.isAdmin) {
         where.isActive = true;
      }

      User.findAll({where: where, oder: ["name", "ASC"]}).then(function (users) {
         res.json(users);
      }).catch(next);
   });

   // Put: Update by id
   app.put(singleAndPlural("/:id"), app.isAuthenticated, function (req, res, next) {
      var id = req.params.id;
      var password = req.body.password;
      delete req.body.password;

      // Nur Admin oder man selber kann Daten ändern
      if (!req.user.isAdmin && req.user.id !== req.body.id) {
         return next(new Error(NO_PERMISSIONS));
      }

      // Admin kann sich selber nicht Adminrechte nehmen und deaktivieren
      if (!req.user.isAdmin || req.user.id === req.body.id) {
         delete req.body.isAdmin;
      }

      User.findById(id).then(function (user) {
         if (!user) {
            throw new Error(USER_NOT_FOUND);
         }
         if (password) {
            return new Promise((resolve, reject) => {
               user.setPassword(password, function (err, user) {
                  if (err) {
                     reject(err);
                  }
                  user.save().then(user => resolve(user)).catch(err=>reject(err));
               });
            });
         }
         return user;
      }).then(user => {
         return user.update(req.body);
      }).then(user => {
         res.json(user);
      }).catch(next);
   });

   // Post: Register user
   app.post(singleAndPlural(), function (req, res, next) {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;

      if (!name) {
         return next(new Error(NAME_REQUIRED))
      }

      if (!email) {
         return next(new Error(EMAIL_REQUIRED))
      }

      if (!password) {
         return next(new Error(PASSWORD_REQUIRED))
      }

      delete req.body.password;
      var user = User.build(req.body);
      User.register(user, password, function (err, user) {
         if (err) {
            return next(err);
         }

         res.json(user);
      });
   });

   // Get: User-Activation after Registration and Mail-Verification
   app.get(singleAndPlural("/register/:key"), function (req, res, next) {
      var key = req.params.key;

      if (!key) {
         return next(new Error(KEY_REQUIRED))
      }

      User.findOne({where: {activationKey: key}}).then(function (user) {
         if (user) {
            user.activationKey = null;
            user.email = (user.newEmail) ? user.newEmail : user.email;
            user.newEmail = null;

            user.save().then(function (user) {
               res.json(user);
               // TODO: updateAttributes funktioniert nicht
            }).catch(next);
         } else {
            return next(new Error(KEY_REQUIRED))
         }
      }).catch(next);
   });

   // Post: Reset password
   app.post(singleAndPlural("/request-new-password"), function (req, res, next) {
      var email = req.body.email;

      if (!email) {
         return next(new Error(EMAIL_REQUIRED))
      }
      User.setResetPasswordKey(email, function (err, user) {
         if (err) {
            return next(err);
         }
         res.json(user);
      });
   });

   // Post: Reset password
   app.post(singleAndPlural("/reset-password"), function (req, res, next) {
      var key = req.body.key;
      var email = req.body.email;
      var password = req.body.password;

      if (!email) {
         return next(new Error(EMAIL_REQUIRED))
      }

      if (!password) {
         return next(new Error(PASSWORD_REQUIRED))
      }

      if (!key) {
         return next(new Error(KEY_REQUIRED))
      }
      User.resetPassword(email, password, key, function (err, user) {
         if (err) {
            return next(err);
         }
         res.json(user);
      });
   });

   // Put: Delete by id
   app.delete(singleAndPlural("/:id"), app.isAuthenticated, function (req, res, next) {
      var id = req.params.id;

      // Nur Admin oder man selber kann User löschen
      if (!req.user.isAdmin && req.user.id !== req.body.id) {
         return next(new Error(NO_PERMISSIONS));
      }

      // Admin kann sich selber nicht Adminrechte nehmen und deaktivieren
      if (!req.user.isAdmin || req.user.id === req.body.id) {
         delete req.body.isAdmin;
      }

      User.findById(id).then(function (user) {
         if (!user) {
            return next(new Error(USER_NOT_FOUND));
         }
         user.destroy().then(function () {
            return res.json(user);
         }).catch(next);
      }).catch(next);
   });

   // Post: Login
   app.post(singleAndPlural("/login"), app.passport.authenticate('local'), function (req, res, next) {
      // TODO: isActive checken und prüfen, warum man sich einloggen kann, obwohl man den Registrierungskey noch nicht bestätigt habt (bestätigt => Key = null)

      res.json(req.user);
   });

   // Post: Login with JWT
   app.post(singleAndPlural("/token"), function (req, res, next) {
      // TODO: isActive checken und prüfen, warum man sich einloggen kann, obwohl man den Registrierungskey noch nicht bestätigt habt (bestätigt => Key = null)

      var email = req.body.email;

      User.findOne({where: {email: email, deletedAt: null}}).then(function (user) {
         if (!user) {
            return next(new Error(USER_NOT_FOUND));
         }

         // Helper
         function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
         }

         // Expiry in .. minutes
         var minutes = 180;
         // Generate token with username + key + time
         var token = Token.issue({email: user.email}, minutes);

         // Attach token + expiry to user
         var x = user.toJSON();
         x.token = token;
         x.tokenExpiry = addMinutes(new Date(), minutes);
         res.json(x);
      }).catch(next);
   });
}
