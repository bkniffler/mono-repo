var extend = require("deep-extend");
var ReplaceAll = require("../../../../utils/replace-all");
var multi = require("../../../../utils/multi-bind");

module.exports = function (app, base) {
   var Trace = app.db.model("trace");
   var singleAndPlural = multi([base + "/trace", base + "/traces"]);

   // Search by query string ?query={"where":{"text":{"$ilike":"Test*"}}}
   app.get(singleAndPlural("/:text"), function (req, res, next) {
      var terms = req.params.text.split(' ').map(function(item){return 'text ILIKE \'%'+ ReplaceAll(item, "\\*", "%") + '%\''}).join(' OR ');
      app.db.query('SELECT * FROM traces WHERE ' + terms + ' ORDER BY weight DESC, "updatedAt" DESC', { model: Trace }).then(function(items){
         var grouped = {};
         items.forEach(function(item){
            var key = item.model + '/' + item.documentId;
            if(!grouped[key]){
               grouped[key] = {
                  id: item.documentId,
                  model: item.model,
                  name: item.name,
                  image: item.image,
                  weight: 0,
                  properties: []
               };
            }

            // Calculate weight from weight * length of term(s) found
            var weight = 0;
            req.params.text.split(' ').map(function(term){
               if(item.text.toLowerCase().indexOf(term.toLowerCase()) >= 0){
                  weight += 1000 + (item.weight*term.length);
               }
            });
            grouped[key].properties.push({
               id: item.id,
               weight: weight,
               name: item.property,
               text: item.text
            });
            grouped[key].weight += weight;
         });
         /*var sorted = _.sortByOrder(
            Object.keys(grouped).map(function(key){return grouped[key]}),
            ['weight'], ['desc']);
         res.json(sorted);*/
         res.json(Object.keys(grouped).map(function(key){return grouped[key]}));
      }).catch(next);
   });
}
