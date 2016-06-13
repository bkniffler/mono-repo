var powr = require("../server");
var log = require("debug")("app:example");
var config = require('./config.js')();
var app = powr(config);
app.enableAuth();

app.after('bind:models', ()=>{
   app.db.model('user').enableFileTracking();
   app.db.model('user').enableRevisions();
   app.db.model('user').enableTags('tags');
   app.db.model('user').enableTraces({
      name: true,
      tags: {
         type: "array",
         weight: 90
      },
      image: {
         type: "object",
         weight: 80
      }
   });
});
app.after("db:sync", function () {
   app.db.model('user').register({
      id: '82d1ad47-c934-43e0-92cf-e09a0f35b8f6',
      email: 'admin',
      name: 'Der Admin',
      isActive: true,
      isAdmin: true
   }, 'asd', function (err, item) {
      if (err) {
         console.log(err);
      }
      else {
         console.log('User admin created');
         app.db.model('file').create({
            "id": "db5193a9-8c76-463c-be50-06b072a0092f",
            "ref": "N1xQIP9X6x",
            "name": "test/ekgd/ykftegjzihpfq6v3jivf",
            "original": "facharzt.png",
            "url": "https://res.cloudinary.com/dhsf4vjjc/image/upload/v1458219058/test/ekgd/ykftegjzihpfq6v3jivf.jpg",
            "type": "image",
            "mime": "image/jpg",
            "height": 500,
            "width": 500,
            "size": 13245,
            "colorsGoogle": [
               "white"
            ],
            "colors": [
               "#686868"
            ],
            "comment": null,
            "createdAt": "2016-03-17T12:50:58.430Z",
            "updatedAt": "2016-03-17T12:50:58.430Z",
            "deletedAt": null,
            "tags": []
         }).then((file)=>{
            return app.db.model('user').findOne({where: {email: 'admin'}});
         }).then(user=>{
            user.set('image', {
               url: "https://res.cloudinary.com/dhsf4vjjc/image/upload/v1458219058/test/ekgd/ykftegjzihpfq6v3jivf.jpg"
            });
            return user.save();
         }).catch(err=>{
            console.error(err);
         });
      }
   });
   app.db.model('user').register({
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
});

app.after('bind:socket-io', function(){
   app.io.on('connection', function(socket){
      log('New client');
      socket.on('changed', function(data){
         console.log('Changed', data);
         socket.broadcast.emit('changed', data);
      })
   });
});

app.launch();

app.db.autoBackup(10000);
