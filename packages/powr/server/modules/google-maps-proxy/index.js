var request = require('request');

module.exports = function (app) {
   app.use('/api/gmap/*', function (req, res, next) {
      var url = "http://maps.google.com/maps/api/" + req.originalUrl.split("/api/gmap/")[1];
      req.pipe(request(url, function (err, resp, body) {
         if(err){
            next(err);
         }
      })).pipe(res);
   });
}
