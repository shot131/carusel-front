const del = require('del');

const { path } = require('../gulp_options');

module.exports = () => del(path.clean);
