var constants = require('../constants');

module.exports = function (app) {
  var User = app.db.model("user");
  // Post: Register user
  /*app.post('/api/auth', app.isHuman, (req, res, next) => {
    if (req.body.password.length < 3) {
      next(new ClientError('Password too short.'));
    }
    User.register(req.body, req.body.password).then(user => {
      return Promise.all([
        Promise.resolve(user),
        app.sendMail({
          fromName: 'Content-Management',
          from: 'info@kniffler.com',
          subject: 'Registrierungsbestätigung',
          text: app.get('url') + '?confirm=' + user.get('activationKey'),
          to: user.get('email')
        })
      ]);
    }).then((results) => {
      res.json(results[0]);
    }).catch(err => next(err));
  });*/

  // Get: User-Activation after Registration and Mail-Verification
  app.get('/api/auth/confirm/:key', (req, res, next) => {
    User.activate(req.params.key).then(user => res.json(user)).catch(err => next(err));
  });
}


/*// Post: Reset password
app.post('/api/account/request-new-password', app.isHuman, (req, res, next) => {
  var email = req.body.email;

  if (!email) {
    return next(new ClientError(constants.EMAIL_REQUIRED));
  }
  User.setResetPasswordKey(email, (err, user) => {
    if (err) {
      return next(err);
    }
    res.json(user);
  });
});

// Post: Reset password
app.post(getUrl("/reset-password"), (req, res, next) => {
  var key = req.body.key;
  var email = req.body.email;
  var password = req.body.password;

  if (!email) {
    return next(new ClientError(constants.EMAIL_REQUIRED))
  }

  if (!password) {
    return next(new ClientError(constants.PASSWORD_REQUIRED))
  }

  if (!key) {
    return next(new ClientError(constants.KEY_REQUIRED))
  }
  User.resetPassword(email, password, key, (err, user) => {
    if (err) {
      return next(err);
    }
    res.json(user);
  });
});

 // Put: Delete by id
 app.delete(getUrl("/:id"), app.isAuthenticated, (req, res, next) => {
 var id = req.params.id;

 // Nur Admin oder man selber kann User löschen
 if (!req.user.isAdmin && req.user.id !== req.body.id) {
 return next(new ClientError(constants.NO_PERMISSIONS));
 }

 // Admin kann sich selber nicht Adminrechte nehmen und deaktivieren
 if (!req.user.isAdmin || req.user.id === req.body.id) {
 delete req.body.isAdmin;
 }

 User.findById(id).then(user => {
 if (!user) {
 return next(new ClientError(constants.USER_NOT_FOUND));
 }
 user.destroy().then(() => {
 return res.json(user);
 }).catch(next);
 }).catch(next);
 });


 var Token = require("powr/server/core/api-token");

 // Post: Login with JWT
 app.post(getUrl("/token"), (req, res, next) => {
 var email = req.body.email;

 User.findOne({where: {email: email, deletedAt: null}}).then(user => {
 if (!user) {
 return next(new ClientError(constants.USER_NOT_FOUND));
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
 });*/
