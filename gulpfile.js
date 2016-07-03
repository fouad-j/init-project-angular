var gulp = require('gulp');
var path = require("path");
var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var runSequence = require('run-sequence').use(gulp);
var addStream = require('add-stream');

var htmlmin = require('gulp-htmlmin');
var ngTemplate = require('gulp-angular-templatecache');

var less = require('gulp-less');
var cssmin = require('gulp-cssmin');

var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var ngAnnotate = require('gulp-ng-annotate');

var browserSync = require('browser-sync').create();
var express = require('express');
var karma = require('karma');

var sources = {
  entry: 'src/index.html',
  templates: [
    'src/**/*.html',
    '!src/index.html'
  ],
  styles: [
    'src/**/*.less'
  ],
  scripts: [
    'src/app.js',
    'src/**/*.js',
    '!src/**/*.spec.js'
  ],
  dependenciesJS: [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/angular/angular.min.js',
    'node_modules/angular-ui-router/release/angular-ui-router.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js'
  ],
  dependenciesCSS: [
    'node_modules/bootstrap/dist/css/bootstrap.min.css'
  ]
};

var build = 'build/';

gulp.task('build-js', function() {
  function prepareTemplates() {
    return gulp.src(sources.templates)
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeTagWhitespace: true
      }))
      .pipe(ngTemplate({module: 'app'}));
  }

  function prepareApp() {
    return gulp.src(sources.scripts)
      .pipe(babel())
      .pipe(ngAnnotate())
      .pipe(addStream.obj(prepareTemplates()))
      .pipe(uglify());
  }

  /* return gulp.src(sources.scripts)
    .pipe(babel())
    .pipe(ngAnnotate())
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(build))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(build));*/

  return gulp.src(sources.dependenciesJS)
    .pipe(addStream.obj(prepareApp()))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(build));
});

gulp.task('copy-icons', function() {
  return gulp.src('node_modules/bootstrap/dist/fonts/**.*')
    .pipe(gulp.dest(path.join(build, 'fonts')));
});

gulp.task('build-css', ['copy-icons'], function() {
  function prepareCSS() {
    return gulp.src(sources.styles)
      .pipe(less())
      .pipe(cssmin());
  }

  /* return gulp.src(sources.styles)
   .pipe(less())
   .pipe(concat('styles.css'))
   .pipe(gulp.dest(build))
   .pipe(cssmin())
   .pipe(rename({suffix: '.min'}))
   .pipe(gulp.dest(build));*/

  return gulp.src(sources.dependenciesCSS)
    .pipe(addStream.obj(prepareCSS()))
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest(build));
});

gulp.task('build-html', function() {
  return gulp.src(sources.entry)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true
    }))
    .pipe(gulp.dest(build));
});

gulp.task('build', ['build-html', 'build-js', 'build-css']);

gulp.task('clean', function() {
  return del(path.join(build, '*'));
});

gulp.task('karma', function(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task('karmaa', function(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: false,
    autoWatch: true
  }, done).start();
});

gulp.task('watch', function() {
  gulp.watch([sources.scripts, sources.templates], ['build-js']);
  gulp.watch([sources.styles], ['build-css']);
  gulp.watch([sources.entry], ['build-html']);
});

gulp.task('lint', function() {
  return gulp.src(sources.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('server', function() {
  var app = express();
  app.use(express.static(path.join(__dirname, 'build')));
  app.listen(3000, '0.0.0.0');
  console.log('Server express started and listen on :' + 3000);
});

gulp.task('serve', ['clean', 'lint', 'karma', 'build', 'server', 'watch'], function() {
  browserSync.init({
    server: {
      baseDir: build
    }
  });

  gulp.watch([build + '/*']).on('change', browserSync.reload);
});

gulp.task('default', function(done) {
  runSequence('clean', ['lint', 'karma'], 'build', done);
});
