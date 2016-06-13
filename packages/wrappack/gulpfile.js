var webpack = require("webpack");

module.exports = function (config, callback, log) {
   if (!log) log = console.log;
   global.NODE_ENV = process.env.NODE_ENV = 'production';
   return Promise.all([
      build("./webpack.config.prod.js", config, log),
      build("./webpack.config.srv.js", config, log)
   ]).then(x => {
      if (callback) callback();
      return { browser: x[0], server: x[1] };
   }).catch(err => {
      if (callback) callback(err);
      else throw err;
   });
}

var build = (script, config, log) => new Promise((resolve, reject) => {
   var devCompiler = webpack(require(script)(config));
   devCompiler.run((err, stats) => {
      log(stats.toString({ colors: true }));

      if (!!err) {
         reject(err);
      } else {
         resolve(stats);
      }
   });
});

