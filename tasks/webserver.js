const browserSync = require('browser-sync').create();

const config = require('../gulp_options').browserSyncConfig;

module.exports = () => {
    browserSync.init(config);
    browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
};
