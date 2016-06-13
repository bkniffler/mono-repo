var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin-fix2450");
var webpackBaseConfig = require("./webpack.config.base");
var nodeExternals = require('webpack-node-externals');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function (config) {
   return Object.assign(webpackBaseConfig(config), {
      devtool: "inline-cheap-module-source-map",
      externals: [nodeExternals({
         modulesDir: path.resolve(config.root, 'node_modules')
      })],
      target: 'node',
      entry: {
         server: path.resolve(path.dirname(config.app), 'app.js')
      },
      output: {
         path: path.resolve(config.root, 'www', 'server'),
         filename: "[name].js",
         publicPath: "/",
         libraryTarget: "umd"
      },
      plugins: [
         new CleanWebpackPlugin(['server'], {
            root: path.resolve(config.root, 'www'),
            verbose: false,
            dry: false
         }),
         new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de/),
         new ExtractTextPlugin("bundle.css", {allChunks: true}),
         new webpack.DefinePlugin({
            "process.env": {
               BROWSER: JSON.stringify(false),
               NODE_ENV: JSON.stringify("production")
            },
            DATA_ENCRYPTION_KEY: JSON.stringify(config.dataEncryptionKey),
            APP_URL: JSON.stringify(config.url),
            DEBUG: false,
            IO: config.socketIO,
            BROWSER: false,
            SERVER: true
         })
      ]
   });
};
