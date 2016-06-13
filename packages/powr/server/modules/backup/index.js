var Backup = require('./backup');
var path = require('path');
var log = require("debug")("powr:sequelize:backup");
module.exports = function(app){
   var backup = Backup(
      require("debug")("xxx")
   );
   app.db.backup = function(){
      var config = app.get('backup') || {};
      log('Starting backup');
      backup.backup(app.db, {
         folder: config.folder || path.resolve(app.get('root'), 'backup'),
         exclude: config.exclude
      }).then(()=>{
         log('Backup done');
      }).catch(err=>{
         log(err);
      });
   }
   app.db.restore = function(){
      var config = app.get('backup') || {};
      log('Starting restore');
      backup.restore(app.db, {
         folder: config.folder || path.resolve(app.get('root'), 'backup'),
         exclude: config.exclude
      }).then(()=>{
         log('Restore done');
      }).catch(err=>{
         log(err);
      });
   }
   app.after('bind:api', function(){
      var config = app.get('backup') || {};
      if(config.api){
        backup.express(app, app.db, {
           folder: config.folder || path.resolve(app.get('app'), 'backup'),
           exclude: config.exclude,
           base: '/api/backup'
        });
      }
   });
   app.after('db:connect', function(){
      var config = app.get('backup') || {};
      if(config.auto){
         log('Setting auto-backup');
         setInterval(()=>{
            app.db.backup();
         }, config.auto);
      }
      if(config.restore){
         log('Restore');
         app.db.restore();
      }
   });
}
