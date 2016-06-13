var axios = require("axios");

module.exports = function(settings, req){
   var client = {};

   var genarator = function(method, path, data, config, extendResult) {
      if(!config) config = {};
      config.withCredentials = true;
      config.headers = {Accept: 'application/json'};
      config.params = {};

      if (SERVER) {
         config.params.server_token = settings.serverToken;
         if (req.get("cookie")) {
            config.headers.cookie = req.get("cookie");
         }
      }

      if (method === 'get' || method === 'delete') {
         data = config;
         config = undefined;
      }

      return new Promise(function(resolve, reject) {
         axios[method](formatUrl(path, settings), data, config).then(function(result) {
            if (!result.data) {
               result.error = new Error('Empty response for ' + method + ': ' + path);
            } else if (result.data.error) {
               result.error = result.data.error;
            }
            if (result.error) {
               if(client.errorHandlers.filter(function(handler){
                     return handler(result.error, result);
                  }).length === 0) {
                  reject(extendResult ? result : result.error);
               }
            } else {
               resolve(extendResult ? result : result.data);
            }
         }).catch(function(err){
            var error;
            if (err.data.error) {
               error = err.data.error;
            } else if (err.error) {
               error = err.error;
            } else error = err;
            if(client.errorHandlers.filter(function(handler){
                  return handler(error, err);
               }).length === 0){
               reject(extendResult ? err : error);
            }
         });
      })
   };

   client.get = function(path, config, extendResult) {
      return genarator('get', path, null, config, extendResult);
   }
   client.delete = function(path, config, extendResult) {
      return genarator('delete', path, null, config, extendResult);
   }
   client.post = function(path, data, config, extendResult) {
      return genarator('post', path, data, config, extendResult);
   }
   client.put = function(path, data, config, extendResult) {
      return genarator('put', path, data, config, extendResult);
   }
   client.patch = function(path, data, config, extendResult) {
      return genarator('patch', path, data, config, extendResult);
   }
   client.upload = function(path, payload, config) {
      var promises = [].slice.call(payload.files).map(function(file, index){
         var data = new FormData();
         data.append('file', file);
         return client.post(path, data, config);
      });
      return Promise.all(promises);
   }
   client.errorHandlers = [];
   client.handleError = function(cb) {
      client.errorHandlers.push(cb);
      return function() {
         client.errorHandlers.splice(client.errorHandlers.indexOf(cb), 1);
      }
   }
   return client;
}

// Format URL
function formatUrl(path, settings) {
   var adjustedPath;
   // http://...
   if(path.indexOf("http") === 0){
      return path;
   }
   // ./upload => /upload
   else if(path.indexOf("./") === 0){
      adjustedPath = path.substr(1);
   }
   // /user => /api/user
   else if(path.indexOf("/") === 0){
      adjustedPath = "/api" + path;
   }
   // user => /api/user
   else {
      adjustedPath = "/api/" + path;
   }
   if (SERVER) {
      // Prepend host and port of the API server to the path.
      return settings.url + adjustedPath;
   }
   else if (typeof ELECTRON !== 'undefined' && ELECTRON) {
      // Prepend host and port of the API server to the path.
      return ELECTRON.URL + adjustedPath;
   }
   // Prepend `/api` to relative URL, to proxy to API server.
   return adjustedPath;
}
