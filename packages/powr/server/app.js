var Helmet = require("../shared/helmet").Helmet;
var React = require('react');
var ReactDOM = require('react-dom/server');
var ApiClient = require('../shared/api-client');
var RouteHookHandler = require('../shared/route-hook-handler');
var match = require('react-router').match;
var RouterContext = require('react-router').RouterContext;
var stringifySafe = require('json-stringify-safe');
var fs = require('fs');
var log = require('debug')('powr:app');

var assets = (req) => {
   var debug = process.env.NODE_ENV !== 'production';
   var fingerprint = debug ? x => x : x => req.assetFingerprint(x);
   return {
      get: x => fingerprint(x),
      style: x => `<link rel="stylesheet" href="${fingerprint(x)}"/>`,
      script: x => `<script src="${fingerprint(x)}"></script>`
   };
};

module.exports = function (_app) {
   var ssrPath = process.env.NODE_ENV === 'production' ? _app.get('ssr') : null;
   if(!ssrPath || !fs.existsSync(ssrPath)){
      ssrPath = null;
      log('Using ssr path', ssrPath);
   } else {
      log('Not using ssr');
   }

   var template = null;
   function send(req, res, options, config){
      var templates = _app.get('templates');
      // Refresh template in debug
      if (process.env.NODE_ENV !== 'production' && templates['default'] === 'string') {
         template = null;
      }

      if (!template && typeof templates['default'] === 'string') {
         delete require.cache[require.resolve(templates['default'])]
         template = require(templates['default']);
      } else if (!template) {
         template = templates['default'];
      }

      if(process.env.NODE_ENV === 'production' && _app.get('caching') && _app.get('caching').app) {
         var expires = new Date(Date.now() + _app.get('caching').app);
         res.setHeader("Expires", expires.toUTCString() );
         res.setHeader("Cache-Control", "public; max-age=" + Math.floor((expires.getTime() - new Date().getTime() ) / 1000) );
      }

      res.send(template(options, _app.get('config'), assets(req)));
   }


   _app.get("/**", function (req, res, next) {
      if (req.originalUrl.indexOf('/js/') === 0 || req.originalUrl.indexOf('/css/') === 0) {
         return next();
      }
      function renderOnClient() {
         send(req, res, {
            html: null,
            url: req.originalUrl,
         });
      };
      if (!ssrPath) {
         return renderOnClient();
      }

      var mod = require(ssrPath);
      var app = mod.default?mod.default():mod();
      app.apiClient = ApiClient(_app.get('config'), req);
      app.routes = app.routes(RouteHookHandler);

      var promises = [];

      for (var key in app.store) {
         if (typeof app.store[key] === 'function') {
            app.store[key] = new app.store[key]({});
         }
         app.store[key].apiClient = app.apiClient;
         if (app.store[key].initialize) {
            promises.push(app.store[key].initialize({server: true}));
         }
      }

      RouteHookHandler.init(app.store);
      const matchRoutes = (error1) => match({routes: app.routes, location: req.originalUrl}, (error2, redirectLocation, renderProps) => {
         const error = error1 || error2;
         if (redirectLocation) {
            res.redirect(redirectLocation.pathname + redirectLocation.search);
         } else if (error) {
            if (error === 404) {
               next(new ClientError('Not found', 404));
            } else {
               res.status(500);
               next(error);
            }
         } else if (!renderProps) {
            next(new ClientError('Not found', 404));
         } else {
            // var state = app.store.getState();
            var Root = React.createClass({
               getChildContext() {
                  var context = {};
                  for (var key in Root.childContextTypes) {
                     context[key] = app[key];
                  }
                  return context;
               },

               childContextTypes: {},

               render() {
                  return React.createElement(RouterContext, renderProps);
               }
            });

            var types = [];
            for (var key in app) {
               var type = typeof app[key];
               if (React.PropTypes[type]) {
                  types.push(key + ':' + type);
                  Root.childContextTypes[key] = React.PropTypes[typeof app[key]];
               }
            }

            var data = {};
            for(var key in app.store) {
               var store = app.store[key];
               var storeData = store && store.stringify ? store && store.stringify() : null;
               if(storeData){
                  data[key] = storeData;
               }
            }
            data = Object.keys(data).length > 0 ? stringifySafe(data) : null;

            if (data && _app.get('dataEncryptionKey')) {
               var AES = require("crypto-js/aes");
               data = data ? AES.encrypt(data, _app.get('dataEncryptionKey')).toString() : null;
            } else if (data) {
               var Utf8 = require("crypto-js/enc-utf8");
               var Base64 = require("crypto-js/enc-base64");
               data = Utf8.parse(data);
               data = Base64.stringify(data);
            }

            send(req, res, {
               html: ReactDOM.renderToString(React.createElement(Root)),
               head: Helmet.rewind(),
               url: req.originalUrl,
               data: data
            });
         }
      });
      Promise.all(promises)
         .then(() => matchRoutes())
         .catch(matchRoutes);
   });
}
