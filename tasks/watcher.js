const gulp = require('gulp');

const { path } = require('../gulp_options');

module.exports = () => {
    gulp.watch(path.watch.styles, gulp.series('styles'));
    gulp.watch(path.watch.html, gulp.series('html'));
};
