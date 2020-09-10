module.exports.isProduction = (process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : '') === 'production';
module.exports.isWatch = process.argv.includes('--watch');

module.exports.browserSyncConfig = {
    server: {
        baseDir: './dist',
    },

    // tunnel: true,
    open: false,
    injectChanges: false,
    logFileChanges: false,
    host: 'localhost',
    port: 3000,
};

module.exports.path = {
    dist: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        publicPath: '/assets/js/',
    },

    src: {
        html: 'src/pages/**/*.html',
        styles: 'src/pages/**/*.styl',
        js: 'src/pages/**/*.js',
    },

    watch: {
        styles: 'src/**/*.{styl,css}',
        html: 'src/**/*.html',
    },

    clean: ['./dist'],
};
