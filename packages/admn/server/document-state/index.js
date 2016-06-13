module.exports = function(app){
   app.before('bind:models', function(){
      var usage = require('./utils/document-state')(app.db, {
         log: require("debug")("powr:sequelize:document-state")
      });
   });
   app.after('bind:api', function(){
      require('./api')(app, '/api');
   });
}
