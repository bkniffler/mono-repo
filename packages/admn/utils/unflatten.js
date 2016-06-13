var sortBy = require('lodash/sortBy');
module.exports = function (array, options, parentId, level) {
   if(!options) options = {};
   if(!options.parentId) options.parentId = "parentId";
   if(!options.id) options.id = "id";

   parentId = typeof parentId !== 'undefined' ? parentId : null;
   level = typeof level !== 'undefined' ? level : 0;
   var children = array.filter(function (item) {
      return item[options.parentId] == parentId;
   }).map(function (item) {
      return item;
   });
   children = sortBy(children, function (item) {
      return item.order;
   });
   children.forEach(function (item) {
      item.children = module.exports(array, options, item[options.id], level + 1);
   });
   return children;
};
