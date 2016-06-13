var constants = require('../constants');

module.exports = function (app) {
  // Post: Login
  app.post('/api/auth/login', app.passport.authenticate('local', { session: false, scope: [] }), (req, res, next) => {
    var user = req.user.toJSON();
    user.jwt = app.jwt.sign({ userId: req.user.id });
    res.cookie('authorization', user.jwt, {
      expires: new Date(Date.now() + app.jwt.options.expiresIn),
      httpOnly: true
    });
    res.json(user);
  });

  // Get: Logout
  app.get('/api/auth/logout', app.isAuthenticated, (req, res, next) => {
    res.clearCookie('authorization');
    res.json({valid: true})
  });

  // Get: Get me
  app.get('/api/auth/me', app.isAuthenticated, (req, res, next) => {
    if (!req.user) {
      next(new ClientError(constants.NO_USER));
    } else {
      req.user.jwt = app.jwt.sign({ userId: req.user.id });
      res.cookie('authorization', req.user.jwt, {
        expires: new Date(Date.now() + app.jwt.options.expiresIn),
        httpOnly: true
      });
      res.json(req.user);
    }
  });
}
