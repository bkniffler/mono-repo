/* eslint-disable no-var */
var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin-fix2450");
var webpackBaseConfig = require("./webpack.config.base");
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function (config) {
   return Object.assign(webpackBaseConfig(config), {
      devtool: "hidden-cheap-module-source-map",
      /*externals: {
       "react": "React",
       "react-dom": "ReactDOM"
       },*/
      entry: {
         app: path.resolve(path.dirname(config.app), "browser.js"),
         //vendor: ['react', 'react-dom', 'moment', 'react-router', 'crypto-js', 'mobx', 'history']
      },
      output: {
         path: path.resolve(config.root, 'www', 'client'),
         publicPath: "/",
         chunkFilename: "app.[id].js",
         filename: "[name].js"
      },
      plugins: [
         new CleanWebpackPlugin(['client'], {
            root: path.resolve(config.root, 'www'),
            verbose: false,
            dry: false
         }),
         /*new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: Infinity,
          filename: 'vendor.bundle.js'
          }),*/
         new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
         }),
         new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de/),
         new ExtractTextPlugin("bundle.css", {allChunks: true}),
         new webpack.DefinePlugin({
            "process.env": {
               BROWSER: JSON.stringify(true),
               NODE_ENV: JSON.stringify("production")
            },
            DATA_ENCRYPTION_KEY: JSON.stringify(config.dataEncryptionKey),
            APP_URL: JSON.stringify(config.url),
            DEBUG: false,
            IO: config.socketIO,
            BROWSER: true,
            SERVER: false
         }),
         new webpack.optimize.OccurrenceOrderPlugin(),
         new webpack.optimize.UglifyJsPlugin({
            compress: {
               warnings: false
            },
            output: {
               comments: false
            },
            sourceMap: true
         }),
      ]
   });
};
