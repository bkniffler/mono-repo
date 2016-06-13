var path = require("path");
var fs = require("fs");
var config = require('./config.js')();

/*if (process.env.NODE_ENV !== 'production' && fs.existsSync(path.resolve(__dirname, '..', 'node_modules', 'wrappack', 'package.json'))) {
  console.log('**WARNING** ALIASING wrappack');
  require('wrappack/alias')(config);
}*/

var admn = require("../server");
var app = admn(config);

app.addCollections([
  path.resolve(__dirname, 'collections', 'event.json'),
  path.resolve(__dirname, 'collections', 'event.mock.json'),
  path.resolve(__dirname, 'collections', 'location.json'),
  path.resolve(__dirname, 'collections', 'location.mock.json')
]);

app.after("db:sync", function () {
  /*app.db.model('user').register({
   id: 'f760021d-4fcc-4f3c-bc7f-ab527a11e04e',
   email: 'admin',
   name: 'Der Admin',
   isActive: true,
   isAdmin: true
   }, 'asd', function (err, item) {
   if (err) {
   console.log(err);
   }
   else {
   console.log('User admin created')
   }
   });
   app.db.model('user').register({
   id: 'f9e4e0b4-45a4-41e2-8fc8-35b3e14f242a',
   email: 'user',
   name: 'Der User',
   isActive: true,
   isAdmin: false
   }, 'asd', function (err, item) {
   if (err) {
   console.log(err);
   }
   else {
   console.log('User user created')
   }
   });
   app.db.model('page').upsert({name: 'Home', slug: '/home'}).then(function (item) {
   console.log('Page created', item)
   }).catch(function (error) {
   console.log(error);
   });
   app.db.model('meta').upsert({name: 'Default'}).then(function (item) {
   console.log('Meta created', item)
   }).catch(function (error) {
   console.log(error);
   });
   app.db.model('file').upsert({"id":"6ce2bade-b4b4-49c3-93d7-d00a05b56879","ref":"NyIQBp0te","name":"test/ekgd/lrh6xh5ywyqhouvrrvbe","original":"b7cc39d6adbbeaf76c41a4b7dc5c1427.jpg","url":"https://res.cloudinary.com/dhsf4vjjc/image/upload/v1454757380/test/ekgd/lrh6xh5ywyqhouvrrvbe.jpg","type":"image","mime":"image/jpg","height":177,"width":205,"size":5079,"colorsGoogle":["teal","brown"],"colors":["#ccc2ba","#9c9484","#3c3424","#ac9c8c","#402c14"],"comment":"qdqwq","createdAt":"2016-02-06T11:16:21.721Z","updatedAt":"2016-02-06T12:53:31.438Z","deletedAt":null}).then(function (item) {
   console.log('File created', item)
   }).catch(function (error) {
   console.log(error);
   });*/
});

app.launch();
