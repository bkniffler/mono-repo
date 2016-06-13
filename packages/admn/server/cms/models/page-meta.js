var Sequelize = require("sequelize");
var DataTypes = require('sequelize/lib/data-types');

module.exports = function(app){
   var Meta = app.db.define("meta", {
      id: {
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      startPage: {
         type: Sequelize.UUID
      },
      name: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },
      description: {
         type: Sequelize.TEXT
      },
      json: {
         type: Sequelize.JSON,
         defaultValue: {}
      }
   }, {
      paranoid: true
   });

   //Meta.enableRevisions();
   return Meta;
}
