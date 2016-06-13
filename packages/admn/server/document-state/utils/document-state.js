var Sequelize = require('sequelize');
var deepExtend = require('deep-extend');

module.exports = function (sequelize, options) {
   if (!options) {
      options = {};
   }
   var log = options.log || console.log;

   sequelize.Model.prototype.enableDocumentState = function (mandatoryFields) {
      var Model = this;
      log('Enable document state on ' + this.name);

      this.documentState = true;
      this.options.paranoid = true;

     /* this.addScope('defaultScope', deepExtend({ }, (this.options.scopes['defaultScope'] ? this.options.scopes['defaultScope'].$scope : {}), {
         where: { isPublished: true },
         paranoid: true,
      }), { override: true });

      this.addScope('archive', deepExtend({ }, (this.options.scopes['archive'] ? this.options.scopes['archive'].$scope : {}), {
         where: { isPublished: false },
         paranoid: true,
      }), { override: true });

      this.addScope('trash', deepExtend({ }, (this.options.scopes['trash'] ? this.options.scopes['trash'].$scope : {}), {
         where: { deletedAt: { $ne: null } },
         paranoid: false,
      }), { override: true });*/

      this.attributes["isPublished"] = {
         type: Sequelize.BOOLEAN,
         defaultValue: true
      };
      this.attributes["isValid"] = {
         type: Sequelize.BOOLEAN,
         defaultValue: false
      };

      this.refreshAttributes();


      const beforeFind = options => {
        if (!options.documentState) return;
        if(options.documentState === 'archive') {
          options.where = deepExtend({}, { isPublished: false }, options.where);
          options.paranoid = true;
        } else if(options.documentState === 'trash') {
          options.where = deepExtend({}, { deletedAt: { $ne: null } }, options.where);
          options.paranoid = false;
        } else {
          options.where = deepExtend({}, { isPublished: true }, options.where);
          options.paranoid = true;
        }
      };

      var afterDelete = function (instance) {
         /*if(instance.get('_state') !== 'deleted'){
          instance.set('_state', 'deleted');
          instance.save();
          }*/
      };

      var after = function (instance) {
         var valid = true;
         var state = instance.get('isValid');
         for(var i=0; i<mandatoryFields.length; i++){
            var x = mandatoryFields[i];
            if(!instance.get(x)){
               valid = false;
               break;
            }
         }

         if(valid && !state){
            instance.set('isValid', true);
            instance.save();
         }
         else if(!valid && state){
            instance.set('isValid', false);
            instance.save();
         }
      };

      this.addHook('afterCreate', after);
      this.addHook('afterUpdate', after);
      this.addHook('afterDelete', afterDelete);
      this.addHook('beforeFind', beforeFind);

      return this;
   };


   return {}
}
