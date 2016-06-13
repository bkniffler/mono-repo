var Sequelize = require('sequelize');

module.exports = function (app, options) {
   if (!options) {
      options = {};
   }
   if(!options.key || !options.secret){
      app.log('Mailjet not configured');
      return;
   }
   else{
      app.log('Mailjet loading');
   }
   app.mailjet = require('node-mailjet').connect(options.key, options.secret);
   app.sendMail = function(params){
      return new Promise(function(success, fail){
         var request = app.mailjet.post("send").request({
            "FromEmail": params.from||"info@kniffler.com",
            "FromName": params.fromName||params.from||"Website",
            "Subject": params.subject,
            "Text-part": params.text,
            "Html-part": params.html,
            "Recipients":[{"Email": params.to}]
         });

         request.on('success', function (response, body) {
            success(body);
         }).on('error', function (err, response) {
            fail(err);
         });
      });
   }
}
