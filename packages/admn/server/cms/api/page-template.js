var multi = require("powr/multi-bind");

module.exports = function (app, base) {
   var Meta = app.db.model("template");
   var singleAndPlural = multi([base + "/template"]);

   // Get
   app.get(singleAndPlural(), function(req, res, next) {
      Meta.findAll().then(function(meta){
         res.json(meta);
      }).catch(next);
   });

   // Put: Update
   app.put(singleAndPlural('/:id'), app.isAuthenticated, function (req, res, next) {
      Meta.findById(req.params.id).then(function(item){
         item.updateAttributes(req.body).then(function(item) {
            res.json(item);
         }).catch(next);
      }).catch(next);
   });

   // Post: New
   app.post(singleAndPlural(), app.isAuthenticated, function (req, res, next) {
      Meta.create(req.body).then(function(item){
         res.json(item);
      }).catch(next);
   });
}
