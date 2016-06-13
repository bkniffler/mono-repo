module.exports = function(app){
   app.before('bind:models', function(){
      var usage = require('./utils/scheduled')(app.db, {
         log: require("debug")("powr:sequelize:scheduled"),
      });
   });
}
