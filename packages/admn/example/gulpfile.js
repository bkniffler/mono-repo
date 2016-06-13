var gulp = require('gulp');

gulp.task("build", function (callback) {
  global.DEBUG = false;
  global.ROOT = __dirname;
  require('powr-dev/gulpfile')(
    require('./config.js')(), callback
  );
});
