var multi = require("../../../../utils/multi-bind");

module.exports = function (app, base) {
   var File = app.db.model("file");
   var FileUsage = app.db.model("file-usage");
   var singleAndPlural = multi([base + "/file-usage", base + "/file-usages"]);

   app.get(singleAndPlural('/:id'), function (req, res, next) {
      var id = req.params.id;
      File.findOne({where: {ref: id}}).then(x=>{
         if(!x){
            throw new Error('Could not find file with ref ' + id);
         }
         return FileUsage.findAll({where: {url: x.url}})
      }).then(x=>{
         return res.json(x);
      }).catch(err=>next(err));
   });
}
