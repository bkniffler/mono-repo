module.exports = function(app){
   app.before('bind:models', function(){
      var usage = require('./utils/file-usage')(app.db, {
         log: require("debug")("powr:sequelize:file-usage"),
         UUID: true
      });
      usage.defineModels();
   });
   app.after('bind:api', function(){
      require('./api')(app, '/api');
   });
}
