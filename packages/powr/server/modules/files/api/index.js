var multi = require("../../../utils/multi-bind");
var Rest = require("../../../utils/crud-gen");

module.exports = function (app, base) {
   var File = app.db.model("file");
   var singleAndPlural = multi([base + "/file", base + "/files"]);
   var auto = Rest.rest(File);

   app.get(singleAndPlural('/tags'), function(req, res, next){
      File.taggable.query()
         .then(function(data){res.json(data)})
         .catch(function(err){next(err)});
   });
   //BindTags(app, File, singleAndPlural('/tags'), {cache: true, property: "tags"});
   /*app.get(singleAndPlural("/excel"), json2xls.middleware, function(req, res, next) {
      var query = req.query.query ? JSON.parse(req.query.query) : {};
      if(!query.order){
         query.order = '"createdAt" DESC';
      };
      req.context.findAll(File, query).then(function(files){
         res.xls(
            'files_'+new Date()+'.xlsx',
            files.map(function(item){return item.toJSON();}),
            {fields: ["id", "original", "colorsGoogle", "comment", "tags"]}
         );
      }).catch(next);
   });
   app.post(singleAndPlural("/excel"),function(req, res, next) {
      var query = req.query.query ? JSON.parse(req.query.query) : {};
      if(!query.order){
         query.order = '"createdAt" DESC';
      };
      req.context.findAll(File, query).then(function(files){
         res.xls('data.xlsx', files.map(function(item){return item.toJSON();}));
      }).catch(next);
   });*/

   app.get(singleAndPlural("/colors"), function (req, res, next) {
      File.findAll({attributes: ["colorsGoogle"]}).then(function(files){
         var colors = {};
         files.forEach((file)=> {
            file.get("colorsGoogle").forEach((color)=> {
               if(!colors[color]){
                  colors[color] = 0;
               }
               colors[color] = colors[color] + 1;
            })
         });
         res.json(Object.keys(colors).map(function(color){
            return {
               color: color,
               count: colors[color]
            }
         }));
      }).catch(next);
   });
   app.get(singleAndPlural("/color/:color"), function (req, res, next) {
      File.findAll({where: {colorsGoogle: {$contains: [req.params.color]}}}).then(function(files){
         res.json(files);
      }).catch(next);
   });
   app.get(singleAndPlural('/:id'), auto.getById);
   app.get(singleAndPlural(), auto.get);
   // Put: Restore deleted
   app.put(singleAndPlural("/:id/restore"), app.isAuthenticated, auto.restore);
   // Put: Update by id
   app.put(singleAndPlural("/:id"), app.isAuthenticated, auto.put);
   // Delete: Delete by id
   app.delete(singleAndPlural("/:id"), app.isAuthenticated, auto.del);
}
