var path = require('path');

module.exports =  function (app, _config) {
   var log = app.log || console.log;
   log('powr-dev', 'Plugging in wrappack!');

   var bind = function(){
      log('powr-dev', 'adding webpack');

      var webpack = require('webpack');
      var config = require('./webpack.config.dev')(_config||app.get('config'));
      const compiler = webpack(config);
      app.use(require('webpack-dev-middleware')(compiler, {
         noInfo: true,
         publicPath: config.output.publicPath,
      }));

      app.use(require('webpack-hot-middleware')(compiler));
   };

   if(app.before){
      app.before('bind:middleware', bind);
   }
   else{
      bind();
   }
}
