const gulp = require('gulp');
const babel = require('gulp-babel');
const less = require('gulp-less');
const runSequence = require('run-sequence');
const electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('src/app.js', function() {
    runSequence(
      ['babel', 'less'],
      'restart'
    )
  })

  // Reload renderer process
  gulp.watch(['src/view/**/*.*', 'lib/view/index.html'], function() {
    runSequence(
      ['babel', 'less'],
      'reload'
    )
  })
})

gulp.task('default', ['babel', 'less']);

gulp.task('babel', function () {
  return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['env', 'react']
        }))
        .pipe(gulp.dest('lib'));
})

gulp.task('less', function () {
  return gulp.src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib'));
})

gulp.task('restart', function () {
  electron.restart()
})

gulp.task('reload', function () {
  electron.reload()
})
