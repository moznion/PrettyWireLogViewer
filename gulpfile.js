var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    if (typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = 'test';
    }
    return gulp.src('test/*', {read: false})
        .pipe(mocha({ui: 'bdd', reporter: 'spec'}));
});

