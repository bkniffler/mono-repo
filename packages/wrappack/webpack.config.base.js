var path = require('path'); // eslint-disable-line no-var
var ExtractTextPlugin = require('extract-text-webpack-plugin-fix2450'); // eslint-disable-line no-var
var autoprefixer = require('autoprefixer'); // eslint-disable-line no-var

var defaultAliases = (config) => ({
   _app_: path.resolve(path.dirname(config.app))
});

var arrayialize = obj => obj ? Object.keys(obj).map(x=>obj[x]) : [];

module.exports = function (config) {
   var alias = Object.assign({}, config.alias || {}, defaultAliases(config));
   var aliasArray = arrayialize(alias);
   return {
      resolve: {
         alias: alias,
         extensions: ['', '.js', '.jsx', '.less'],
         modules: [
            path.dirname(config.app),
            'node_modules'
         ]
      },
      module: {
         loaders: [
            {
               test: /(\.jsx|\.js)$/,
               loader: 'babel',
               query: {
                  presets: [
                     'es2015-native-modules',
                     'react',
                     'stage-0',
                  ],
                  plugins: [
                     //path.resolve(config.root, 'node_modules', 'babel-plugin-add-module-exports'),
                     'transform-decorators-legacy'
                  ],
                  env: {
                     development: {
                        presets: ['react-hmre']
                     }
                  }
               },
               exclude: /node_modules/,
               include: aliasArray
            }, {
               test: /\.less$/,
               loader: config.cssModules === false
                  ? ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!less-loader?outputStyle=expanded&sourceMap')
                  : ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[local]___[hash:base64:5]!postcss-loader!less-loader?outputStyle=expanded&sourceMap'),
               include: aliasArray
            }, {
               test: /\.less$/,
               loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!less-loader?outputStyle=expanded&sourceMap'),
               exclude: aliasArray
            }, {
               test: /\.css$/,
               loader: config.cssModules === false
                  ? ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
                  : ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[local]___[hash:base64:5]!postcss-loader'),
               include: aliasArray
            }, {
               test: /\.css$/,
               loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader'),
               exclude: aliasArray
            }, {
               test: /\.(png|jpg|gif|ico)$/,
               loader: 'file',
               query: {
                  name: '[name].[ext]'
               }
            },
         ],
      },
      postcss: [autoprefixer({browsers: ['> 1%']})],
   }
};
