module.exports = function(app){
   app.before('bind:models', function(){
      var usage = require('./utils/order')(app.db, {
         log: require("debug")("powr:sequelize:custom-order"),
      });
   });
}
