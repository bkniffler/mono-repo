/* eslint-disable no-var */
var path = require('path');
var webpack = require('webpack');
var webpackBaseConfig = require('./webpack.config.base');
var ExtractTextPlugin = require("extract-text-webpack-plugin-fix2450");

module.exports = function (config) {
   return Object.assign(webpackBaseConfig(config), {
      devtool: 'cheap-module-eval-source-map',
      entry: {
         app: [
            'webpack-hot-middleware/client',
            // 'react-hot-loader/patch',
            path.resolve(path.dirname(config.app), 'browser.js')
         ],
      },

      output: {
         path: path.resolve(config.root, 'www', 'assets'),
         filename: '[name].js',
         publicPath: '/'
      },

      plugins: [
         new ExtractTextPlugin('bundle.css', {disable: true}),
         new webpack.HotModuleReplacementPlugin(),
         new webpack.NoErrorsPlugin(),
         new webpack.DefinePlugin({
            "process.env": {
               BROWSER: JSON.stringify(true),
               NODE_ENV: JSON.stringify("debug")
            },
            DATA_ENCRYPTION_KEY: JSON.stringify(config.dataEncryptionKey),
            APP_URL: JSON.stringify(config.url),
            DEBUG: true,
            IO: config.socketIO,
            BLUEBIRD_DEBUG: 1,
            BROWSER: true,
            SERVER: false
         })
      ],
   });
}
