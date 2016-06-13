module.exports = function () {
   var _store, _isomorphic, _initialized, _firstLocation;

   return {
      init: function (store, isomorphic) {
         if (BROWSER) {
            window.addEventListener("beforeunload", function (e) {
               var keys = Object.keys(store).filter(function (item) {
                  return store[item] && store[item].dirty === true
               });
               if (keys.length > 0) {
                  var confirmationMessage = "Es sind noch ungespeicherte Änderungen vorhanden.";
                  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
                  return confirmationMessage;                            //Webkit, Safari, Chrome
               }
               return null;
            });
         }
         _store = store;
         _isomorphic = BROWSER && isomorphic;
         _initialized = true;
         _firstLocation = BROWSER ? window.location.pathname : null;
      },
      enter: function (component, clientSideOnly) {
         var onEnter = component.onEnter;
         var name = component.displayName;
         if (!onEnter && component.WrappedComponent) {
            onEnter = component.WrappedComponent.onEnter;
            name = component.WrappedComponent.displayName;
         }
         if (!onEnter && component.WrappedComponent && component.WrappedComponent.WrappedComponent) {
            onEnter = component.WrappedComponent.WrappedComponent.onEnter;
            name = component.WrappedComponent.WrappedComponent.displayName;
         }
         if (!onEnter) {
            return;
         }
         var hasCallback = onEnter.length > 4;

         return function (next, transition, cb) {
            if (!next) {
               if (cb) {
                  return cb();
               } else {
                  return;
               }
            }

            // Enable skipping for first load if isomorphic
            if (_isomorphic) {
               if (_firstLocation === next.location.pathname) {
                  if (cb) {
                     return cb();
                  }
                  else {
                     return;
                  }
               }
               if (_firstLocation !== next.location.pathname) {
                  _isomorphic = false;
               }
            }

            //console.log('ROUTES', next.routes.map(p=>p.path +':'+ p.component.displayName).join(', '));
            try {
               if (!BROWSER && clientSideOnly) {
                  return cb(null, null)
               }
               else {
                  var promise = onEnter(next, transition, _store, cb);
                  (promise && promise.then ? promise : Promise.all([])).then(function (data) {
                     cb(null, null);
                  })["catch"](function (err) {
                     console.error('Unhandled promise rejection in "' + name + '" while transition to "' + next.location.pathname + '"', err, err.stack);
                     cb(null, null)
                     //cb(err, null);
                  });
               }
               return;

               var promise = onEnter(next, transition, _store, cb);
               if (!hasCallback) {
                  if (promise && (promise.promise || promise.then)) {
                     if (BROWSER/* && (promise.force || clientSideOnly)*/) {
                        promise = promise.promise || promise;
                     }
                     else if (!BROWSER && !clientSideOnly) {
                        promise = promise.promise || promise;
                     }
                     else {
                        promise = null;
                     }
                  }
                  if (promise && promise.then) {
                     promise.then(function (data) {
                        return cb(null, null)
                     })
                        .catch(function (err) {
                           cb(err, null)
                        });
                  }
                  else {
                     cb(null, null);
                  }
               }
            }
            catch (err) {
               if (err.message === "Cannot read property 'pathname' of null") {
                  console.error(err);
                  cb(null, null);
               }
               else {
                  //var route = next.branch[next.branch.length-1];
                  //var error = new Error(`Error during transition to ${next.location.pathname} [${route.component.displayName}]: ${err.message}`, err)
                  console.error(err);
                  cb(err, null);
               }
            }
         }
      },
      leave: function (component) {
         var onLeave = component.onLeave;
         if (!onLeave && component.WrappedComponent) {
            onLeave = component.WrappedComponent.onLeave;
         }
         if (!onLeave && component.WrappedComponent && component.WrappedComponent.WrappedComponent) {
            onLeave = component.WrappedComponent.WrappedComponent.onLeave;
         }
         if (!onLeave) {
            return;
         }

         return function () {
            try {
               onLeave(_store);
            }
            catch (err) {
               //var route = next.routes[next.routes.length-1];
               console.error('Error during transition', err);
            }
         }
      },
      change: function (component) {
         var onChange = component.onChange;
         if (!onChange && component.WrappedComponent) {
            onChange = component.WrappedComponent.onChange;
         }
         if (!onChange && component.WrappedComponent && component.WrappedComponent.WrappedComponent) {
            onChange = component.WrappedComponent.WrappedComponent.onChange;
         }
         if (!onChange) {
            return;
         }

         return function (previous, next, replace, cb) {
            try {
               var called = false;
               var promise = onChange(previous, next, _store, replace);
               (promise && promise.then ? promise : Promise.all([])).then(function (data) {
                  cb(null, null);
               })["catch"](function (err) {
                  console.error('Unhandled promise rejection in "' + name + '" while transition to "' + next.location.pathname + '"', err, err.stack);
                  cb(null, null)
                  //cb(err, null);
               });
            }
            catch (err) {
               if (err.message === "Cannot read property 'pathname' of null") {
                  console.error(err);
                  cb(null, null);
               }
               else {
                  //var route = next.branch[next.branch.length-1];
                  //var error = new Error(`Error during transition to ${next.location.pathname} [${route.component.displayName}]: ${err.message}`, err)
                  console.error(err);
                  cb(err, null);
               }
            }
         }
      }
   }
}();
