/* eslint-disable no-param-reassign */
const webpack = require('webpack');

// Provide the middleware and Extensible functions globally
const provideGlobals = (webpackConfig) => {
    webpackConfig.plugins.forEach((plugin) => {
        if (plugin instanceof webpack.ProvidePlugin) {
            plugin.definitions.ExtUtils = [
                '@scandipwa/scandipwa-extensibility/ExtUtils',
                'default'
            ];
        }
    });

    return webpackConfig;
};

module.exports = provideGlobals;
