var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    bower = require ('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    del = require('del');

gulp.task('test', function () {
    if (typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = 'test';
    }
    return gulp.src('test/*', {read: false})
        .pipe(mocha({ui: 'bdd', reporter: 'spec'}));
});

gulp.task('lint', function () {
    return gulp.src(['src/js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('bower', ['cleanup-vendor'], function () {
    var jsFilter = gulpFilter('**/*.js'),
        cssFilter = gulpFilter('**/*.css');

    return gulp.src(bower())
        .pipe(jsFilter)
        .pipe(gulp.dest('vendor/js'))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(gulp.dest('vendor/css'));
});

gulp.task('cleanup-vendor', function () {
    del.sync('vendor/');
});
