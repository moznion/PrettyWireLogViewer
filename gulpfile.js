var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

gulp.task('test', function () {
    if (typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = 'test';
    }
    return gulp.src('test/*', {read: false})
        .pipe(mocha({ui: 'bdd', reporter: 'spec'}));
});

gulp.task('lint', function () {
    return gulp.src(['src/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});
