const addPlugins = require('./add-plugins');

const injectBabelConfig = (babelConfig) => addPlugins(babelConfig);

module.exports = injectBabelConfig;
