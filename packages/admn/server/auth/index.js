var passportLocalSequelize = require("./utils/passport");

module.exports = function (app, options) {
  // Add passport to app
  var passport = require('passport');
  app.passport = passport;

  app.isSecure = (req, res, next) => req.isServer ? next() : app.isAuthenticated(req, res, next);
  app.isHuman = (req, res, next) => !req.human && !req.user && !req.isServer ? next(new ClientError('Invalid session, are you a human?')) : next();
  app.isAuthenticated = (req, res, next) => !req.user ? next(new ClientError("Auth required", 401)) : next();
  app.isAdmin = (req, res, next) => !req.user || !req.user.isAdmin ? next(new ClientError("Permission required", 401)) : next();

  app.jwt = require('./utils/jwt')(app, {
    secret: app.get('secret')
  });

  // After models
  app.before("bind:models", function () {
    var User = require('./model')(app, x => passportLocalSequelize.getUserModel(x, options));
    passportLocalSequelize.attach(User, options);
    app.passport.use(User.createStrategy());
    app.passport.serializeUser(User.serializeUser());
    app.passport.deserializeUser(User.deserializeUser());
  });

  // After middlewares
  app.after('bind:middleware', function () {
    app.use(passport.initialize());
    app.use(app.jwt.middleware);
  });

  app.all('*', (req, res, next) => {
    if (req.query.server_token === app.get('serverToken')) {
      req.isServer = true;
    }
    next();
  });
  // After API
  app.after("bind:api", function () {
    //app.all(['/api/account', '/api/account/*', '/api/accounts', '/api/accounts/*', '/api/user', '/api/user/*', '/api/users', '/api/users/*'], app.ratelimiter('user'));
    require('./api/human')(app);
    require('./api/login')(app);
    require('./api/registration')(app);
    require('./api/user-api')(app);
  });
}
