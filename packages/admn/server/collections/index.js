var Sequelize = require("sequelize");
var log = require("debug")("admn:collections");
var path = require('path');
var extend = require('deep-extend');
var fs = require('fs');
var ShortId = require('shortid');

var mapTypes = {
   image: 'jsonb'
}

module.exports = function(app){
   var collections = {};
   var mocks = {};

   app.addCollections = function(cols){
      (cols || []).forEach(function(item){
         app.addCollection(item);
      });
   }
   app.getCollection = function(name){
      return collections[name]
   }
   app.addCollection = function(item){
      var json = require(item);
      var key = json.name;
      collections[key] = extend(collections[key] || {}, json);
      if(json.mock){
         mocks[key] = json.mock;
      }
      delete collections[key].mock;
   }

   // Get models
   app.after("bind:models", function () {
      log("Collection models", Object.keys(collections));
      require("./models/model")(app);
      var associations = {};
      var models = Object.keys(collections).map(function(key){
         var collection = collections[key];
         if(!collection.schema) collection.schema = [];
         if(!associations[key]) associations[key] = {};

         var attributes = {
            id: {
               primaryKey: true,
               type: Sequelize.TEXT,
               defaultValue: ShortId.generate
            }
         };
         var options = {
            paranoid: true
         }
         collection.schema.forEach(function(item){
            var type = (item.type || 'text').toLowerCase();
            // is association
            if(item.type && item.type.indexOf('(') !== -1){
               var model = type.split('(')[1].split(')')[0];
               if(type.indexOf('belongstomanyothers') !== -1){
                  associations[key][item.name] = {type: 'belongsToMany', model: model, as: item.name, through: model + '_' + key};
               }
               else if(type.indexOf('belongstomany') !== -1){
                  associations[key][item.name] = {type: 'belongsToMany', model: model, as: item.name, through: key + '_' + model};
               }
               else if(type.indexOf('belongsto') !== -1){
                  associations[key][item.name] = {type: 'belongsTo', model: model, as: item.name};
               }
               else if(type.indexOf('hasone') !== -1){
                  log('HasOne in Collections is not supported');
               }
               /*else if(type.indexOf('hasone') !== -1){
                                  if(!associations[model]) associations[model] = {};
                                  associations[key][item.key] = {type: 'hasOne', model: model, as: item.key};
                                  associations[model][key] = {type: 'belongsTo', model: key, as: key};
                               }*/
               else if(type.indexOf('hasmany') !== -1){
                  associations[key][item.name] = {type: 'hasMany', model: model, as: item.name};
               }
            }
            // is text, integer, bool, ...
            else if(item.type){
               var sequelizeType = Sequelize[(mapTypes[type] || type).toUpperCase()];
               if(sequelizeType){
                  attributes[item.name] = {
                     type: sequelizeType
                  };
               }
            }
         });
         var model = app.db.define(collection.name, attributes, options);
         (collection.plugins||[]).forEach(function(plugin){
            var name = typeof plugin === 'string' ? plugin : plugin.name;
            if(model['enable'+name]){
               //log('Enable plugin ' + plugin + ' on ' + collection.key);
               model['enable'+name](plugin.options||null);
            }
         });
         return model;
      });
      for(var key in associations) {
         for(var subkey in associations[key]) {
            var association = associations[key][subkey];
            log('Creating association ' + key + '.' + association.as + '=' + association.type + '(' + association.model + ')');
            app.db.model(key)[association.type](app.db.model(association.model), {
               as: association.as,
               through: association.through
            });
         }
      }
   });

   // Create API endpoints
   app.after("bind:api", function () {
      log("Collection API");
      var base = "/api";
      require("./api")(app, base);
   });

   // Parse hardcoded collectionn after db sync
   app.after(app.get('database') && app.get('database').sync ? "db:sync" : 'launch', function(){
      // Setup file watcher if chokidar exists
      if(fs.existsSync(path.resolve(__dirname, '..', '..', '..', 'node_modules', 'chokidar', 'package.json'))){
         log("Setup chokidar");
         var chokidar = require('chokidar');
         var watcher = chokidar.watch(path.resolve(__dirname, '..', '..', 'example', 'collections'), {ignored: /^\./, persistent: true});
         watcher
            .on('change', function(path) {
               try{
                  var file = JSON.parse(fs.readFileSync(path));
                  console.log('File', path, 'has been changed');
                  if(file && file.name){
                     app.db.model('model').upsert({
                        id: file.name,
                        json: file
                     })
                  }
               }
               catch(err){
                  console.log('File', path, 'has invalid json');
               }
            })
            .on('error', function(error) {console.error('Error in wilewatcher', error);});
      }
      Object.keys(collections).map(function(key){
         app.db.model('model').upsert({
            id: key,
            json: collections[key]
         }).catch(function(err){
           console.log(err);
         });
      });
      for(var key in mocks) {
         var mock = mocks[key];
         log('Creating mock ' + key);
         Promise.all(mock.map(function(item){
            return app.db.model(key).upsert(item);
         }))
      }
   });
}
