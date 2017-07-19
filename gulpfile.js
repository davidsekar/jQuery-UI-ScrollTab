var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var typeScript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var tsProject = typeScript.createProject("tsconfig.json");
var rimraf = require('rimraf');

var paths = {
  deps: ['deps/js/**/*.js', 'deps/css/**/*'],
  html: ['src/**/*.html'],
  scss: ['src/scss/**/*.scss'],
  ts: ['src/ts/**/*.ts'],
};

var dest = {
  root: 'dist/',
  js: 'dist/js',
  css: 'dist/css'
};

function refreshBrowserSync(done) {
  browserSync.reload();
  done();
}

gulp.task('ts', function () {
  return tsProject.src()
    // .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest.js));
});

gulp.task('html', function () {
  return gulp.src(paths.html)
    .pipe(gulp.dest(dest.root));
});

gulp.task('ts-watch', ['ts'], refreshBrowserSync);

gulp.task('html-watch', ['html'], refreshBrowserSync);

gulp.task('scss', function () {
  return gulp.src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dest.css));
});

gulp.task('scss-watch', ['scss'], refreshBrowserSync);

gulp.task('copy-dependency', function () {
  return gulp.src(paths.deps, {
      base: './deps'
    })
    .pipe(gulp.dest(dest.root));
});

gulp.task('clean', function () {
  return rimraf('dist/**', function () {
    // console.log('completed');
  });
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('watch', ['copy-dependency', 'html', 'scss', 'ts'], function (done) {
  // Serve files from the root of this project
  browserSync.init({
    ui: {
      port: 8080
    },
    server: {
      baseDir: "./dist"
    }
  });

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.watch(paths.ts, ['ts-watch']);
  gulp.watch(paths.scss, ['scss-watch']);
  gulp.watch(paths.html, ['html-watch']);
});

// use default task to launch Browsersync and watch JS files
gulp.task('default', ['copy-dependency', 'scss', 'ts', 'html']);
