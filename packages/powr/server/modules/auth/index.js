var passportLocalSequelize = require("./utils/passport");

module.exports = function(app, options){
   if(!options) options = {};

   // Add passport to app
   var passport = require('passport');
   app.passport = passport;

   app.isSecure = function(req, res, next) {
      if(req.isServer){
         next();
      }
      else{
         app.isAuthenticated(req, res, next);
      }
   };
   app.isAuthenticated = function(req, res, next) {
      if(!req.user){
         var error = new Error("Auth required");
         error.status = 401;
         return next(error);
      }
      next();
   };
   app.isAdmin = [app.isAuthenticated, function(req, res, next) {
      if(!req.user.isAdmin){
         var error = new Error("Permission required");
         error.status = 401;
         return next(error);
      }
      next();
   }];

   // Set req.isServer if serverToken provided
   app.all('*', function(req, res, next){
      if(req.query.server_token === app.get('serverToken')){
         req.isServer = true;
      }
      next();
   });

   // After models
   app.before("bind:models", function () {
      var User = options.user || require('./model')(app);
      passportLocalSequelize.attachToUser(User, {
         activationRequired: true,
         usernameField: 'email'
      });
      app.passport.use(User.createStrategy());
      app.passport.serializeUser(User.serializeUser());
      app.passport.deserializeUser(User.deserializeUser());
   });

   // After middlewares
   app.after('bind:middleware', function(){
      app.use(passport.initialize());
   });

   // After API
   app.after("bind:api", function () {
      require('./api')(app, '/api');
   });
}
