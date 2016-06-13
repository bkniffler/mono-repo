var Sequelize = require("sequelize");
var ShortId = require('shortid');

module.exports = function(app){
   var Page = app.db.define("page", {
      id: {
         primaryKey: true,
         type: Sequelize.UUID,
         defaultValue: Sequelize.UUIDV4
      },
      ref: {
         type: Sequelize.TEXT,
         defaultValue: ShortId.generate,
         allowNull: false
      },
      placeholder: {
         type: Sequelize.BOOLEAN,
         defaultValue: false
      },
      boundTo: {
         type: Sequelize.TEXT
      },
      boundQuery: {
         type: Sequelize.JSONB
      },
      name: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      parent: {
         type: Sequelize.TEXT
      },
      order: {
         type: Sequelize.INTEGER,
         defaultValue: 0,
         allowNull: false
      },
      description: {
         type: Sequelize.TEXT
      },
      slug: {
         type: Sequelize.TEXT,
         unique: true,
         allowNull: false
      },
      menu: {
         type: Sequelize.TEXT
      },
      json: {
         type: Sequelize.JSON,
         defaultValue: {},
         allowNull: false
      },
      blocks: {
         type: Sequelize.JSON,
         defaultValue: {},
         allowNull: false
      },
      templateName: {
         type: Sequelize.TEXT
      },
      templateData: {
         type: Sequelize.JSON,
         defaultValue: {},
         allowNull: false
      }
   }, {
      paranoid: true
   });

   Page.belongsTo(app.db.model("template"), {
      foreignKey: "templateId",
      constraints: true
   });

   Page.enableRevisions();
   Page.enableFileTracking();
   Page.enableTraces({
      name: true,
      tags: {
         type: "array",
         weight: 90
      },
      blocks: {
         type: "blocks",
         weight: 80
      },
      slug: {
         weight: 60
      }
   });
   return Page;
}
