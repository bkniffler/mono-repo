var path = require('path');
var gulp = require('gulp');

gulp.task("build", function (callback) {
    require('wrappack/gulpfile')(
        require('./config.js')(), callback
    );
});
