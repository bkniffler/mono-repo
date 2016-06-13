var Sequelize = require("sequelize");
var DataTypes = require('sequelize/lib/data-types');

module.exports = function(app){
   var Model = app.db.define("template", {
      id: {
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      name: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },
      template: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      json: {
         type: Sequelize.JSON,
         defaultValue: {}
      }
   }, {
      paranoid: true
   });

   //Model.enableRevisions();
   return Model;
}
