var googleAuth = require('google-oauth-jwt');

module.exports = function (app, base) {
  var config = app.get('googleAnalytics');

  if (config) {
    var authOptions = {
      email: config.email,
      keyFile: config.pemPath,
      scopes: ['https://www.googleapis.com/auth/analytics']
    };

    app.get('/api/google-analytics', app.isAuthenticated, function (req, res, next) {
      googleAuth.authenticate(authOptions, function (err, token) {
        res.json({token: token});
      });
    });
  }
};
