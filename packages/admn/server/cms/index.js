module.exports = function (app) {
  // After models
  app.after("bind:models", function () {
    require("./models/page-meta")(app);
    require("./models/page-template")(app);
    require("./models/page")(app);

    app.db.model('file').enableTraces({
      comment: true,
      original: true
    });

    // Hooks
    require("./hooks/user")(app);
  });

  // After API
  app.after("bind:api", function () {
    require("./api/page-meta")(app, '/api');
    require("./api/page-template")(app, '/api');
    require("./api/page")(app, '/api');
    require("./api/google-analytics")(app, '/api');
  });
}
