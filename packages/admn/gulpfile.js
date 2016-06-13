var gulp = require('gulp');
var del = require('del');
var path = require('path');
var babel = require('gulp-babel');

gulp.task('build', function(){
   return new Promise(function(resolve, reject) {
      gulp.src(['src/**/*.js', 'src/**/*.jsx'])
         .on('error', reject)
         .pipe(babel({
           presets: [
             'es2015',
             'react',
             'stage-0',
           ],
           plugins: [
             'transform-decorators-legacy'
           ]
         }))
         .pipe(gulp.dest('lib'))
         .on('end', resolve)
   });
});

gulp.task("build-example", function (callback) {
   global.DEBUG = false;
   require('powr-dev/gulpfile')(
      require('./example/config.js')(), callback
   );
});

var watch = require('gulp-watch');
gulp.task('watch', function() {
   gulp.src(['../powr/**/*', "!../powr/node_modules/**/*", "!../powr/.git/**/*"], {base: '../powr'})
      .pipe(watch('../powr', {base: '../powr'}))
      .pipe(gulp.dest('./node_modules/powr'));
   gulp.src(['../powr-dev/**/*', "!../powr-dev/node_modules/**/*", "!../powr-dev/.git/**/*"], {base: '../powr-dev'})
      .pipe(watch('../powr-dev', {base: '../powr-dev'}))
      .pipe(gulp.dest('./node_modules/powr-dev'));
});
