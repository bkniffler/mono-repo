var log = require("debug")("powr:socket-io");

module.exports = function(app){
   log('Plug-In SocketIO');
   app.on('started', function(server){
      app.bindSockets = app.hook("bind:socket-io", function () {
         log("Binding SocketIO");
         app.io = require('socket.io')(server);
      });
      app.bindSockets();
   });
}
