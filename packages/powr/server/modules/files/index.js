var cloudinary = require('cloudinary')
var fs = require('fs');
var path = require("path");
var multiparty = require('multiparty');
var quantize = require('quantize');
var request = require('request');

var log = require('debug')("powr:upload");

module.exports = function (app) {
   var config = app.get('upload');
   if(!config){
      return log('No uploader config provided.');
   }

   app.after("bind:models", function () {
      require('./model')(app);
   });

   // After API
   app.after("bind:api", function () {
      require('./api')(app, '/api');
   });

   cloudinary.config(config.cloudinary);

   app.after('bind:api', function(){
      if (app.get('env') === 'development') {
         app.get("/__upload-test", function (req, res) {
            res.send(
               '<form action="/upload" method="post" enctype="multipart/form-data">' +
               'Datei:<br>' +
               '<input type="file" name="file" value="">' +
               '<br><br>' +
               '<input type="submit" value="Absenden">' +
               '</form>'
            );
         });
      }

      app.get('/upload', app.isAuthenticated, function (req, res, next) {
         var url = cloudinary.utils.download_zip_url(config.cloudinary.folder);
         req.pipe(request(url, function (err, resp, body) {
            if(err){
               next(err);
            }
         })).pipe(res);
         //res.send({url: cloudinary.utils.zip_download_url('ekgd')});
      });

      app.post('/upload', app.isAuthenticated, function (req, res, next) {
         //log(req);
         log("Uploading file ...");
         /////////////////////////////////////////
         var form = new multiparty.Form();

         // Listen for incoming parts of the form.
         form.on('part', function (part) {
            // It's a field, not a file.
            if (part.filename == null) {
               part.resume();
               // It's a file.
            }
            else {
               // Write file in upload dir.
               var stream = cloudinary.uploader.upload_stream(function (result) {
                  if(result.error){
                     return next(result.error);
                  }
                  log("Uploaded image");
                  var mime = part.headers && part.headers['content-type'] ? part.headers['content-type'] : (result.resource_type + "/" + result.format);
                  var type = mime.split('/')[0];
                  var format = mime.split('/')[1];
                  //log(result);
                  var f = {
                     name: result.public_id,
                     original: part.filename,
                     height: result.height,
                     size: result.bytes,
                     url: type === 'image' ? result.secure_url : result.secure_url.replace('.'+format, '.jpg'),
                     //url: result.secure_url,
                     type: type,
                     mime: mime,
                     width: result.width,
                     userId: req.user ? req.user.id : null,
                     cloudinary: result,
                     colors: [],
                     colorsGoogle: [],
                     // hash: hash.read()
                     // tags: []
                  };

                  if (result.colors) {
                     quantize(result.colors.map(color => hexToRgb(color[0].substring(0, 7))), 5)
                        .palette()
                        .map(color => f.colors.push(rgbToHex(color)));
                  }
                  if(result.predominant){
                     result.predominant.google.forEach(function(color){
                        if(color[1] > 45 || (f.colorsGoogle.length <= 1 && color[1] > 30) || f.colorsGoogle.length === 0){
                           f.colorsGoogle.push(color[0]);
                        }
                     });
                  }

                  var model = app.db.model("file");
                  model.create(f).then(function(a) {
                     log("Persisted image");
                     return res.json(a);
                  }).catch(next);
               }, {
                  //public_id/folder: req.body.title, => Ordner/Kontext
                  //phash: null, => hash, um ähnliche bilder zu matchen
                  //image_metadata/exif: true => geodaten, datum, etc.
                  //raw_convert: aspose => .pdf generation aus dokumenten
                  resource_type: 'auto',
                  folder: config.cloudinary.folder,
                  //format: "jpg",
                  colors: true,
                  tags: [config.cloudinary.folder]
               });

               // Pipe the part parsing stream to the file writing stream.
               part.pipe(stream);
            }
         });

         // End the request when something goes wrong.
         form.on('error', function (err) {
            next(err);
         });
         form.parse(req);
      });
   });
}
function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
   ] : null;
}
function componentToHex(c) {
   var hex = c.toString(16);
   return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(rgb) {
   return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}
