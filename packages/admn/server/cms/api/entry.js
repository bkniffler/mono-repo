var multi = require("powr/multi-bind");
var Rest = require("powr/crud-gen");

module.exports = function (app, base) {
   var Model = app.db.model('entry');
   var singleAndPlural = multi([base + '/entry', base + '/entries']);

   app.get(singleAndPlural('/tags'), function(req, res, next){
      Model.taggable.query()
         .then(function(data){res.json(data)})
         .catch(function(err){next(err)});
   });
   Rest.autoBind(app, base, 'entry', 'entries');
}
