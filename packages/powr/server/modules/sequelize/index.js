var Sequelize = require("sequelize");
var log = require('debug')("powr:sequelize");
var error = require('debug')("powr:sequelize:error");

// Setup and sync sequelize
module.exports = function (app) {
   var config = createConfig(app.get('database'));
   app.db = new Sequelize(config.db, config.username, config.password, config);

   app.db.authenticate().then(app.hook("db:connect", function () {
      log("Connected db");
      if (config.sync === true) {
         return app.db.sync({force: true})
            .then(app.hook("db:sync", function () {
               log("Synced db");
            }));
      }
   })).catch(function (err) {
      error("Error syncing db", err);
   });

   app.before('bind:api', function () {
      app.use("/api/*", function (req, res, next) {
         // ?query={"where":{"text":{"$ilike":"Test*"}}}
         if (req.query && req.query.query) {
            var query = req.query.query.split("\\*").join("%");
            req.query = Object.assign(req.query, JSON.parse(query));
            if (req.query.order && !Array.isArray(req.query.order)) {
               req.query.order = [req.query.order];
            }
            delete req.query.query;
         }

         if (req.query.where) {
            if (req.query.where.$scope) {
               req.query.scope = req.query.where.$scope;
               delete req.query.where.$scope;
            }
            if (req.query.where.$scopes) {
               req.query.scopes = req.query.where.$scopes;
               delete req.query.where.$scopes;
            }
         }
         if (req.params.id || (req.query.where && (req.query.where.id || req.query.where.ref))) {
            req.query.paranoid = false;
         }
         if (req.method.toLowerCase() !== 'get') {
            req.query.paranoid = false;
         }
         next();
      });
   });
}

// Cleanup config
function createConfig(config) {
   if (!config) {
      config = {};
   }
   if (!config.pool) {
      config.pool = {
         max: 5,
         min: 0,
         idle: 10000
      };
   }
   if (!config.dialectOptions && config.ssl) {
      config.dialectOptions = {
         ssl: true
      };
   }
   if (!config.logging && config.log) {
      config.logging = config.log;
   }
   if (!config.dialect) {
      config.dialect = 'sqlite';
   }
   if (!config.storage && config.dialect === 'sqlite') {
      config.storage = './data.db';
   }
   return config;
}
