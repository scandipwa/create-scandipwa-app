/**
 * This file provides the e11y functionality for the CSA setup
 * It has no effect for applications without the build configuration plugin system
 */

const injectBabelConfig = require('./util/babel');
const injectWebpackConfig = require('./util/webpack');

module.exports = {
    plugin: {
        overrideCracoConfig: ({ cracoConfig }) => {
            injectBabelConfig(cracoConfig.babel);

            return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig }) => injectWebpackConfig(webpackConfig)
    }
};
