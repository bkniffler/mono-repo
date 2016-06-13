module.exports = function (app) {
  app.get('/api/human', app.isHuman, (req, res, next) => {
    res.json({valid: true})
  });
}
