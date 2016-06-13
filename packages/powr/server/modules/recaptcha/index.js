var recaptcha = require('express-recaptcha');
var log = require('debug')("powr:recaptcha");

module.exports = function (app) {
   var config = app.get('recaptcha');
   if (!config || !config.site || !config.secret) {
      log('Could not setup Recaptcha, no config found.');
      return;
   }
   /*https://www.google.com/recaptcha/admin#list*/
   recaptcha.init(config.site, config.secret, config.options);
   app.recaptcha = recaptcha.middleware;
   app.recaptchaOrAuth = {
      render: function (req, res, next) {
         if (!req.user) {
            req.recaptcha = recaptcha.render();
         }
         next();
      },
      redirect: function (req, res, next) {
         if (req.user) {
            next();
         }
         else if (req.session && req.session.human) {
            next();
         }
         else {
            res.redirect("/recaptcha-test?next=/upload")
         }
      },
      verify: function (req, res, next) {
         if (req.user) {
            next();
         }
         else if (req.session && req.session.human) {
            next();
         }
         else {
            next(new Error("Proove that you're human"));
         }
      }
   }

   app.before('bind:api', () => {
      app.post("/api/recaptcha", app.recaptcha.verify, function (req, res, next) {
         if (!req.recaptcha.error) {
            req.session.human = true;
            req.session.save(function () {
               res.json({valid: true});
            });
         }
         else {
            next(new Error(req.recaptcha.error));
         }
      });

      app.all("/*", function (req, res, next) {
         req.human = req.session ? req.session.human : false;
         next();
      });
   })

   /*if (app.get('env') === 'development') {
    app.after('bind:api', function () {
    app.get("/recaptcha-test", app.recaptcha.render, function (req, res) {
    res.send(
    '<form action="/recaptcha-test" method="post">' +
    req.recaptcha +
    '<br><br>' +
    '<input type="submit" value="Absenden">' +
    '</form>'
    );
    });
    });
    }*/
}
