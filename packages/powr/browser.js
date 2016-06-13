var React = require('react');
var ReactDOM = require('react-dom');
var ApiClient = require('./shared/api-client');
var RouteHookHandler = require('./shared/route-hook-handler');
var Router = require('react-router').Router;
var browserHistory = require('react-router').browserHistory;
var hashHistory = require('react-router').hashHistory;
var useRouterHistory = require('react-router').useRouterHistory;
var IO = require('socket.io-client');
var useScroll = require('scroll-behavior');

if (module.hot) {
   module.hot.accept();
}

module.exports = function (app) {
   if (typeof app === 'function') {
      app = app();
   }

   var isElectron = typeof ELECTRON === 'object';
   app.history = useScroll(isElectron ? hashHistory : browserHistory);
   app.apiClient = ApiClient();

   var isomorphic = window.__data ? true : false;

   RouteHookHandler.init(app.store, isomorphic);
   app.routes = app.routes(RouteHookHandler);

   var promises = [];
   var socketIO = IO();

   var data = isomorphic ? window.__data : undefined;

   if (data && typeof DATA_ENCRYPTION_KEY !== 'undefined') {
      var AES = require("crypto-js/aes");
      var Utf8 = require("crypto-js/enc-utf8");
      data = AES.decrypt(data, DATA_ENCRYPTION_KEY);
      data = data.toString(Utf8);
   } else if (data) {
      var Base64 = require("crypto-js/enc-base64");
      var Utf8 = require("crypto-js/enc-utf8");
      data = Base64.parse(data);
      data = data.toString(Utf8);
   }
   data = data ? JSON.parse(data) : undefined;
   if (!data) data = {};

   for (var key in app.store) {
      if (typeof app.store[key] === 'function') {
         app.store[key] = new app.store[key](data[key] || {});
      }
      app.store[key].apiClient = app.apiClient;
      app.store[key].socketIO = socketIO;
      if (app.store[key].initialize) {
         promises.push(app.store[key].initialize({browser: true, client: true, isomorphic: isomorphic}));
      }
   }

   Promise.all(promises).then(function () {
      var Root = React.createClass({
         getChildContext: function () {
            var context = {};
            for (var key in Root.childContextTypes) {
               context[key] = app[key];
            }
            return context;
         },
         childContextTypes: {},
         render: function () {
            return React.createElement(Router, {history: app.history}, app.routes);
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

      ReactDOM.render(React.createElement(Root), document.getElementById('app'));
   }).catch(function (err) {
      console.error(err)
   });
}
