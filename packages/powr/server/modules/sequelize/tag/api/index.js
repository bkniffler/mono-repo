var extend = require("deep-extend");
var multi = require("../../../../utils/multi-bind");

module.exports = function(app, base) {
   var Tag = app.db.model("tag");
   var singleAndPlural = multi([base + "/tag", base + "/tags"]);

   app.get(singleAndPlural(), function (req, res, next) {
      Tag.query()
         .then(function(data){res.json(data)})
         .catch(function(err){next(err)});
   });
}
