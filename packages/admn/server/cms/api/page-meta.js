var multi = require("powr/multi-bind");

module.exports = function (app, base) {
   var Meta = app.db.model("meta");
   var singleAndPlural = multi([base + "/meta"]);

   // Get
   app.get(singleAndPlural(), function(req, res, next) {
      Meta.findOne().then(function(meta){
         res.json(meta);
      }).catch(next);
   });
   // Put: Update
   app.put([singleAndPlural(), singleAndPlural('/:id')], app.isAuthenticated, function (req, res, next) {
      Meta.findOne().then(function(item){
         item.updateAttributes(req.body).then(function(item) {
            res.json(item);
         }).catch(next);
      }).catch(next);
   });
}
