var Sequelize = require("sequelize");
var Instance = require('sequelize/lib/instance');
var DataTypes = require('sequelize/lib/data-types');
var ShortId = require('shortid');

module.exports = function (app) {
   var User = app.db.define("user", {
      id: {
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         allowNull: false
      },
      email: {
         type: Sequelize.TEXT,
         allowNull: false,
         unique: true
      },
      newEmail: {
         type: Sequelize.TEXT,
         unique: true
      },
      name: {
         type: Sequelize.TEXT
      },
      description: {
         type: Sequelize.TEXT
      },
      image: {
         type: Sequelize.JSON
      },
      hash: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      salt: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      activationKey: {
         type: Sequelize.TEXT,
         defaultValue: ShortId.generate,
         allowNull: true,
         unique: true
      },
      resetPasswordKey: {
         type: Sequelize.TEXT,
         allowNull: true,
         unique: true
      },
      isActive: {
         type: Sequelize.BOOLEAN,
         defaultValue: false,
         allowNull: false
      },
      isAdmin: {
         type: Sequelize.BOOLEAN,
         defaultValue: false,
         allowNull: false
      }
   }, {
      paranoid: true,
      instanceMethods: {
         toJSON: function () {
            var ret = Instance.prototype.toJSON.call(this);
            delete ret.hash;
            delete ret.salt;
            delete ret.activationKey;
            delete ret.adminKey;
            delete ret.resetPasswordKey;
            return ret;
         }
      }
   });

   return User;
};
