module.exports = function(app){
   app.before('bind:models', function(){
      var tag = require('./utils/trace')(app.db, {
         log: require("debug")("powr:sequelize:trace"),
         UUID: true
      });
      tag.defineModels();
   });
   app.after('bind:api', function(){
      require('./api')(app, '/api');
   });
}
