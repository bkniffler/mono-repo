// Set environment variables for debug.js
process.env.DEBUG_COLORS = 1;
process.env.DEBUG_FD = 1;
process.env.DEBUG = process.env.DEBUG || "app*,powr*,admn*";

var log = require("debug")('powr');
var error = require("debug")('powr:error');
var path = require("path");
var fs = require("fs");

// Handle uncaught exceptions prettily
process.on('uncaughtException', function (err) {
   var PrettyError = require('pretty-error');
   var pe = new PrettyError();
   // this will skip events.js and http.js and similar core node files
   pe.skipNodeFiles();
   pe.skipPackage('express');
   console.log(pe.render(err));
});

// TODO: Remove globals
// Set globals, this will be deprecated soon
global.BROWSER = false;
global.SERVER = true;
global.STANDALONE = false;
global.ELECTRON = false;
global.PHONEGAP = false;
global.DEBUG = process.env.NODE_ENV !== "production";


require.extensions['.css'] = function () {
   return null
}
require.extensions['.less'] = function () {
   return null
}
require.extensions['.scss'] = function () {
   return null
}

module.exports = function (config) {
   // Print powr version from package.json
   var powrPackageJson = require('./package.json');
   log('Starting powr ' + powrPackageJson.version);

   // Get application directory
   var appPath = path.dirname(config.app);

   // TODO: Improve this, make it more reliable
   // Get application root (either appPath or appPath/..)
   var root = fs.existsSync(path.resolve(appPath, 'package.json'))
      ? path.resolve(appPath)
      : path.resolve(appPath, '..');

   // Get application package.json
   var packageJson = require(path.resolve(root, 'package.json'));

   // Merge default config and custom config
   config = Object.assign({
      name: packageJson.name,
      version: packageJson.version,
      root: root,
      appPath: appPath,
   }, defaultConfig(), config);

   // Set url if undefined
   if (!config.url) {
      config.url = 'http://localhost:' + config.port;
   }

   // Return express instance with config
   return require("./server/express")(config);
}

function defaultConfig() {
   return {
      ssr: process.env.NODE_ENV === "production",
      templates: path.resolve(__dirname, '..', 'lib', 'templates'),
      log: process.env.DEBUG || "cryo*,app*,powr*",
      debug: process.env.NODE_ENV !== "production",
      port: process.env.PORT || 3000,
      cache: {
         minutes: 0
      },
      secret: "keyboardcat",
      database: {
         sync: process.env.NODE_ENV !== "production",
         logging: false,
         dialect: 'sqlite'
      }
   };
}
