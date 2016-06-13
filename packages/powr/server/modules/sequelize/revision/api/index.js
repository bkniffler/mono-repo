var multi = require("../../../../utils/multi-bind");

module.exports = function (app, base) {
   var Revision = app.db.model("revision");
   var RevisionChange = app.db.model("revision-change");
   var singleAndPlural = multi([base + "/revision", base + "/revisions"]);

   app.get(singleAndPlural("/:model/:id/:revision/restore"), function (req, res, next) {
      var Model = app.db.model(req.params.model);
      Revision.findOne({where:{model: req.params.model, revision: req.params.revision, documentId: req.params.id}}).then(function(revision){
         Model.findById(req.params.id).then(function(item){
            if(!item){
               return next(new Error("User with id " + id + " not found"));
            }
            item.updateAttributes(revision.document).then(function(x) {
               res.json(x);
            }).catch(next);
         }).catch(next);
      }).catch(next);
   });

   app.get(singleAndPlural("/:model/:id/:revision"), function (req, res, next) {
      var Model = app.db.model(req.params.model);
      Revision.findOne({where:{model: req.params.model, revision: req.params.revision, documentId: req.params.id}}).then(function(revision){
         res.json(revision);
      }).catch(next);
   });

   app.get(singleAndPlural("/:model/:id"), function (req, res, next) {
      Revision.findAll({
         where: {
            model: req.params.model,
            documentId: req.params.id
         },
         include: [{
            model: RevisionChange,
            as: "changes"
         }],
         order: 'revision DESC'
      }).then(function(files){
         res.json(files);
      }).catch(next);
   });
}
