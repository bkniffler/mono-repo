var Sequelize = require("sequelize");
var DataTypes = require('sequelize/lib/data-types');
var ShortId = require('shortid');

module.exports = function(app){
   var File = app.db.define("file", {
      id: {
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      ref: {
         type: DataTypes.TEXT,
         defaultValue: ShortId.generate,
         allowNull: false
      },
      name: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },
      /*hash: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },*/
      original: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      url: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },
      type: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      mime: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      height: {
         type: Sequelize.INTEGER,
         allowNull: false
      },
      width: {
         type: Sequelize.INTEGER,
         allowNull: false
      },
      size: {
         type: Sequelize.INTEGER,
         allowNull: false
      },
      colorsGoogle: {
         type: Sequelize.ARRAY(Sequelize.TEXT),
         allowNull: false
      },
      colors: {
         type: Sequelize.ARRAY(Sequelize.TEXT),
         allowNull: false
      },
      comment: {
         type: Sequelize.TEXT
      },
      author: {
         type: Sequelize.TEXT
      }
   }, {
      paranoid: true
   });

   File.belongsTo(app.db.model("user"), {
      foreignKey: "userId",
      constraints: true
   });

   File.enableTags('tags');
   /*File.enableRevisions();
   File.enableTags('tags');
   File.enableTraces({
      comment: true,
      tags: {
         weight: 90,
         type: "array"
      },
      colorsGoogle: {
         weight: 60,
         type: "array"
      },
      name: true
   });*/

   return File;
}
