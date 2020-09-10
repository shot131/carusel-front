const { src, dest } = require('gulp');
const $ = require('gulp-load-plugins')();

const { path } = require('../gulp_options');

module.exports = () => src(path.src.html)
    .pipe($.flatten())
    .pipe(dest(path.dist.html));
