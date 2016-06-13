module.exports = function(app){
   var plugin;
   app.before('bind:models', function(){
      plugin = require('./utils/revisions')(app.db, {
         userModel: "user",
         log: require("debug")("powr:sequelize:revisions"),
         exclude: [
            "updatedAt", "revision", "hash", "salt", "password",
            "activationKey", "resetPasswordKey", "id", "createdAt"
         ],
         UUID: true
      });
   });
   app.after('bind:models', function(){
      plugin.defineModels();
   });
   app.after('bind:api', function(){
      require('./api')(app, '/api');
   });
}
