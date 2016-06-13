var log = require('debug')('utils:hook');

var app;
// Create hook around function, call emitBefore, emit, emitAfter, and after() automatically
function hook(name, fc, after) {
   return function () {
      var args = arguments;

      var self1 = this;
      return new Promise(function(resolve, reject){
         // emitBefore
         app.emitBefore(name, args).then(function() {
            // call fc() safely
            var promise;
            try{promise = (fc || function(){}).apply(self1, args);}
            catch(err){app.error(err);}
            return promise || Promise.all([]);
         }).then(function() {
            // default emit, not async
            app.emit(name, args);
            return Promise.all([]);
         }).then(function() {
            // emitAfter
            return app.emitAfter(name, args);
         }).then(function() {
            // call after() safely
            var promise;
            try{promise = (after || function(){}).apply(self1, args);}
            catch(err){app.error(err);}
            return promise || Promise.all([]);
         }).then(
            // resolve
            resolve
         ).catch(function(err){
            // reject
            reject(err);
         });
      });
   }
};

// Attach app.before, app.after, app.emitBefore, app.emitAfter, hook
module.exports = function config(_app) {
   app = _app;
   var emitterBefore = getEmitter('before');
   var emitterAfter = getEmitter('after');
   app.before = emitterBefore.on;
   app.emitBefore = emitterBefore.emit;
   app.after = emitterAfter.on;
   app.emitAfter = emitterAfter.emit;
   // Hook a function, call before/after automatically
   app.hook = hook;
};

function getEmitter(n){
   var events = {};
   return {
      on: function(name, fn){
         // add function to events[name]
         if(!events[name]){
            events[name] = [];
         }
         events[name].push(fn);
      },
      emit: function(name){
         // no events? resolve
         if(!events[name]){
            return Promise.all([]);
         }
         var promises = Promise.all([]);
         // map events sequentially, not in parallel
         events[name].map(function(fn){
            promises.then(function(){
               var promise;
               // handle errors
               try{
                  promise = fn();
               }
               catch(err){
                  app.error(err);
               }
               // no promise? create one!
               return promise || Promise.all([]);
            })
         });
         return promises;
      }
   }
}
