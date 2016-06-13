// ExpressJs Server
var debug = require("debug");
var log = debug("powr");
var error = debug("powr:error");
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var PrettyError = require('pretty-error');

var pe = new PrettyError();
// this will skip events.js and http.js and similar core node files
pe.skipNodeFiles();
pe.skipPackage('express');

module.exports = function(config) {
   var app = require('express')();
   var helmet = require('helmet');
   app.use(helmet());
   app.disable('x-powered-by');
   // attach app.log(type, message) -> debug(type)(message)
   app.log = function(type, message){
      if(!message){
         message = type;
         type = 'anonymous';
      }
      debug(type)(message);
   };
   // attach app.error(error) -> pretty error
   app.error = function(error){
      console.log(pe.render(error));
   };

   // Create http server
   app.server = require('http').Server(app);

   // Parse config keys to app.get(key)
   app.set('config', config);
   for(var key in config){
      app.set(key, config[key]);
   }

   // Development mode and powr-dev not installed? Warn!
   var powrDev = app.get('env') === 'development' && fs.existsSync(path.resolve(app.get('root'), 'node_modules', 'wrappack'));
   if(app.get('env') === 'development' && !powrDev){
      log('wrappack must be installed on a dev machine for hot reloading, building, ...');
   }

   // Attach hook system, app.before, app.after, ..
   require("./utils/hook")(app);

   log("Binding hooks");
   // Model hook
   app.bindModels = app.hook("bind:models", function () {
      log("Binding Models");
      var DataTypes = require('sequelize/lib/data-types');
      app.db.define("memory", {
         id: {primaryKey: true, type: DataTypes.TEXT},
         data: {type: DataTypes.JSONB}
      });
   });
   // Middleware hook
   app.bindMiddlewares = app.hook("bind:middleware", function () {
      log("Binding Middlewares");
      // Express middlewares
      app.use(cookieParser(config.secret));

      app.set('trust proxy', 1) // trust first proxy
      app.use(bodyParser.json({ limit: '5mb' }));
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(compression());
      require("./core/favicon")(app);

      require("./core/api-token").init(app, config.secret);

      // More
      require("./core/log")(app);
      require("./core/access-control")(app);
      require("./core/static-files")(app);
      //require("./plugins/sequelize/express-user")(app);
      app.get('/__status', function(req, res, next){
         res.json({status: 'ok'});
      })
   });

   // API hook
   app.bindApi = app.hook("bind:api", function () {
      log("Binding API");
   }, function(){
      app.use("/api/*", function(req, res, next) {
         next(new Error("No handle for " + req.originalUrl));
      });
   });

   // API hook
   app.bindApp = app.hook("bind:app", function () {
      log("Binding react app");
      // Bind react/flux app to /**
      var s = require(path.resolve(__dirname, "app"));
      if(s.default) s.default(app);
      else s(app);
   }, function(){
      // Executing after after hook, handle errors/not-found
      require("./core/error-handler")(app);
   });

   // API hook
   app.listen = app.hook("listen", function () {
      log("Starting server");
      var server = app.server.listen(app.get("port"), function () {
         setTimeout(function () {
            app.emit('started', server);
         }, 1000);
         log('The app is running at http://localhost:' + app.get('port') + " in " + app.get('env'));
      });
   });

   // Launch function
   app.launch = app.hook("launch", function () {
      // Execute bindMiddlewares, bindApi, bindApp and launch!
      return Promise.all([])
         .then(
            app.bindModels
         ).then(
            app.bindMiddlewares
         ).then(
            app.bindApi
         ).then(
            app.bindApp
         ).then(
            app.listen
         ).catch(function(err){
            app.error(err);
         });
   });

   // Attach plugins
   log("Attaching plugins");
   require("./modules/sequelize")(app);
   require('./modules/socket-io')(app);
   require("./modules/mailjet")(app, app.get('mailjet'));
   require("./modules/google-maps-proxy")(app);
   require("./modules/files")(app);
   require("./modules/recaptcha")(app);
   require("./modules/backup")(app);

   app.enableAuth = function(config){
      require('./modules/auth')(app, config);
   };

   app.set('templates', Object.assign( {
      default: path.resolve(__dirname, 'templates', 'default'),
      error: path.resolve(__dirname, 'templates', 'error'),
   }, app.get('templates') || {}));

   // DevTools
   var devTools = path.resolve(app.get('root'), 'node_modules', 'wrappack');
   if(app.get('env') !== 'production' && fs.existsSync(devTools)){
      require('wrappack')(app);
   }

   return app;
}
