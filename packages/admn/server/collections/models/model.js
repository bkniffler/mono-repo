var Sequelize = require("sequelize");
var DataTypes = require('sequelize/lib/data-types');

module.exports = function (app) {
   var Item = app.db.define("model", {
      id: {
         primaryKey: true,
         type: Sequelize.TEXT,
         allowNull: false
      },
      json: {
         type: DataTypes.JSONB,
         allowNull: false
      }
   }, {
      paranoid: true
   });
   return Item;
}
