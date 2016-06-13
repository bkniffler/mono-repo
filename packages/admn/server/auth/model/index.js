var Sequelize = require("sequelize");
var Instance = require('sequelize/lib/instance');

module.exports = function (app, attach, modelOptions) {
  var User = app.db.define("user", attach({
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }), {
    paranoid: true,
    instanceMethods: {
      toJSON: function () {
        var ret = Instance.prototype.toJSON.call(this);
        if (!ret.isAdmin) {
          delete ret.isAdmin;
        }
        return ret;
      }
    }
  });

  // User.sync({force:true})
  return User;
};
