var log = require('debug')('powr:api-token');
var jwt = require("jsonwebtoken");
var verify = require('bluebird').promisify(jwt.verify);

var defaultOptions = {
  expiresIn: 1000 * 60 * 60 * 24 * 7
};

module.exports = (app, options) => {
  options = Object.assign({}, options, defaultOptions);
  var methods = {
    options: options,
    sign: (data, o) => jwt.sign(data, options.secret, Object.assign({}, options, (o || {}))),
    verify: token => verify(token, options.secret),
    middleware: (req, res, next) => {
      var token = null;
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.body && req.body.authorization) {
        token = req.body.authorization;
      } else if (req.query && req.query.authorization) {
        token = req.query.authorization;
      } else if (req.cookies && req.cookies.authorization) {
        token = req.cookies.authorization;
      }

      if (!token) return next();

      methods.verify(token).then(decoded => {
        return app.db.model("user").findById(decoded.userId, false);
      }).then(data => {
        if (!data) throw new ClientError("No user for token, please refresh token", 401);
        log("Authenticated", data.email || data.id);
        req.user = data;
        next();
      }).catch(err => {
        // TODO: Invalid token
        next();
      });
    }
  }; return methods;
}
