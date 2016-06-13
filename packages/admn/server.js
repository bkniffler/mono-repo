process.env.DEBUG = process.env.DEBUG || "app*,powr*,admn*";
var powr = require('powr/server');
var log = require("debug")("admn");

var path = require('path');
var fs = require('fs');
var Sequelize = require("sequelize");

module.exports = function (config) {
  if (!config.templates) {
    config.templates = {};
  }
  if (!config.templates.default) {
    config.templates.default = path.resolve(__dirname, 'www', 'default');
  }

  var app = powr(config);
  if(!config.assets) config.assets = [];
  config.assets.push(path.resolve(__dirname, 'www', 'assets'));

  require('./server/auth')(app, {
    activationRequired: true,
    usernameField: 'email',
    fields: {
      email: {
        type: Sequelize.TEXT,
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
      isActive: {
        type: Sequelize.BOOLEAN
      },
    }
  });
  require('./server/document-state')(app);
  require('./server/scheduled')(app);
  require('./server/custom-order')(app);

  require("powr/server/modules/sequelize/file-usage")(app);
  require("powr/server/modules/sequelize/trace")(app);
  require("powr/server/modules/sequelize/tag")(app);
  require("powr/server/modules/sequelize/revision")(app);

  require('./server/collections')(app);
  require('./server/cms')(app);

  app.after("bind:models", function (data, next) {
    log("Default models");
  });

  app.after("bind:api", function () {
    log("Default API");
  });

  return app;
};
