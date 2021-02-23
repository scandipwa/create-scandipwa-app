const injectBabelConfig = require('./babel');
const injectWebpackConfig = require('./webpack');

const configInjector = { injectBabelConfig, injectWebpackConfig };

module.exports = configInjector;
