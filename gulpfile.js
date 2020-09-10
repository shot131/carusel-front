require('dotenv').config();
const gulp = require('gulp');

const { isWatch, isProduction } = require('./gulp_options');

function lazyRequireTask(taskName, path) {
    gulp.task(taskName, (callback) => {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const task = require(path);
        return task(callback);
    });
}

lazyRequireTask('clean', './tasks/clean');
lazyRequireTask('styles', './tasks/styles');
lazyRequireTask('webpack', './tasks/webpack');
lazyRequireTask('html', './tasks/html');

lazyRequireTask('webserver', './tasks/webserver');
lazyRequireTask('watcher', './tasks/watcher');

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('html', 'styles', 'webpack'),
));

if (isWatch) {
    if (isProduction) {
        // production & watch
        exports.default = gulp.series('build', 'watcher');
    } else {
        // development & watch
        exports.default = gulp.series('build', gulp.parallel('watcher', 'webserver', 'html'));
    }
} else {
    exports.default = gulp.series('build');
}
