var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var JSONStream = require('JSONStream');
var es = require('event-stream');

module.exports = function (log) {
   if(!log) log = console.log;
   var porter = {
      express: function (server, sequelize, options) {
         if (!options) {
            options = {};
         }
         if (!options.base) {
            options.base = '/api/porter';
         }
         if (!options.folder) {
            options.folder = path.resolve(__dirname, '_data');
         }

         mkdirp(options.folder, function (err) {
            if (err) console.error(err)
         });

         log(`Binding backup on ${options.base}`);
         server.get(options.base, function (req, res, next) {
            porter.backup(sequelize, options).then(req.json).catch(next);
         });
      },
      backupModel: function (model, folder) {
         log("Exporting model " + model.name + " to " + folder);
         return model.findAll({paranoid: false}).then(function (data) {
            fs.writeFile(folder, JSON.stringify(data, null, 4), function (err) {
               if (err) {
                  log(err);
               } else {
                  log("JSON saved to " + folder);
               }
            });
         }).catch(function (err) {
            log(err);
         });
      },
      backup: function (sequelize, options) {
         log("Backing up all");
         var promises = Object.keys(sequelize.models).map(function (key) {
            if (options.exclude && options.exclude.split(',').indexOf(key) !== -1) {
               return;
            }
            if (options.include && options.include.split(',').indexOf(key) === -1) {
               return;
            }
            var model = sequelize.models[key];
            return porter.backupModel(model, path.resolve(options.folder, model.name.toLowerCase() + '.json'));
         });
         return Promise.all(promises).then(function () {
            log("Done backing up");
         });
      },
      restoreModel: function (model, folder) {
         log("Importing model " + model.name + " from " + folder);
         var promises = [];
         if (fs.existsSync(folder)) {
            var getStream = function () {
               var jsonData = folder,
                  stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
                  parser = JSONStream.parse('*');
               return stream.pipe(parser);
            };

            return new Promise(function (resolve, reject) {
               var stream = getStream().pipe(es.map(function (row, cb) {
                  if (model.name === 'user') {
                     return model.setPassword(model.build(row), 'asd')
                        .then(function (data) {
                           cb(null, data)
                        }).catch(function (err) {
                           cb(err)
                        });
                  }
                  else {
                     return model.upsert(row, {hooks: false}).then(function (data) {
                        cb(null, data)
                     }).catch(function (err) {
                        cb(err)
                     });
                  }
               }));
               stream.on('error', function (error) {
                  console.error(error);
               }).on('end', function () {
                  log("Done restoring", model.name);
                  resolve();
               });
            });
         }
         else {
            log("Could not find", folder);
            return Promise.resolve();
         }
         return Promise.all(promises).then(function () {
            log("Done restoreing", model.name);
         });
      },
      restore: function (sequelize, options) {
         if (!options) {
            options = {};
         }
         log("Importing all");
         var p = Promise.resolve();
         Object.keys(sequelize.models).forEach(function (key) {
            if (options.exclude && options.exclude.split(',').indexOf(key) !== -1) {
               return;
            }
            if (options.include && options.include.split(',').indexOf(key) === -1) {
               return;
            }
            var model = sequelize.models[key];
            p = p.then(function () {
               return porter.restoreModel(model, path.resolve(options.folder, model.name.toLowerCase() + '.json'))
            });
         });
         return p.then(function () {
            log("Done restoring");
         });
      }
   }
   return porter;
}
