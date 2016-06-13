var log = require('debug')('powr:error-handler');

function ClientError(message, status) {
   this.name = 'ClientError';
   this.message = message || 'Default Message';
   this.stack = (new Error()).stack;
   this.status = status || 400;
}
ClientError.prototype = Object.create(Error.prototype);
ClientError.prototype.constructor = ClientError;
global.ClientError = ClientError;

module.exports = function (app) {
   app.use(function (req, res, next) {
      var err = new ClientError('Not Found', 400);
      next(err);
   });
   app.use(function (err, req, res, next) {
      if (err.name === 'Error' || err.name === 'ClientError') {
         res.status(err.status || 400);
         log("Warning", err.message, res.statusCode, req.url)
      }
      else {
         res.status(err.status || 500);
         app.error(err);
         if (err.errors) {
            log("Errors", err.errors)
         }
      }

      if (req.get('accept') && req.get('accept').indexOf("json") !== -1) {
         res.json({
            error: {
               message: err.message,
               stack: DEBUG && !req.isServer ? err.stack : null,
               errors: err.errors
            }
         });
      }
      else {
         var template = require(app.get('templates')['error']);
         res.send(template({
            url: req.originalUrl,
            code: res.statusCode,
            message: err.message,
            stack: DEBUG && !req.isServer ? err.stack : null,
            errors: err.errors
         }, app.get('config')));
      }
   });
}
