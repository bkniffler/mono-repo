var log = require("debug")("powr:socket-io");

module.exports = function(app){
   app.before('bind:models', function(){
      var tag = require('./utils/tags')(app.db, {
         log: require("debug")("powr:sequelize:tags"),
         UUID: true
      });
      tag.defineModels();
   });
   app.after('bind:api', function(){
      require('./api')(app, '/api');
   });
}
