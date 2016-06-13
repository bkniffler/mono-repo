var favicon = require('serve-favicon');
var path = require('path');
var fs = require('fs');

module.exports = app => {
   if (app.get('favicon')) {
      app.use(favicon(app.get('favicon')));
   } else if (app.get('assets') && Array.isArray(app.get('assets'))) {
      for (var i = 0; i < app.get('assets').length; i++) {
         var faviconPath = path.resolve(app.get('assets')[i], 'favicon.ico');
         if(fs.existsSync(faviconPath)) {
            app.use(favicon(faviconPath));
            break;
         }
      }
   } else if (app.get('assets')) {
      var faviconPath = path.resolve(app.get('assets'), 'favicon.ico');
      if(fs.existsSync(faviconPath)) {
         app.use(favicon(faviconPath));
      }
   }
}
