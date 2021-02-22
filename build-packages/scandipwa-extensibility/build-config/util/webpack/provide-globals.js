/* eslint-disable no-param-reassign */
const webpack = require('webpack');

const extUtilsDefinition = {
    ExtUtils: [
        '@scandipwa/scandipwa-extensibility/ExtUtils',
        'default'
    ]
};

// Provide ExtUtils globally
const provideGlobals = (webpackConfig) => {
    const providePlugin = webpackConfig.plugins.find(
        (one) => one instanceof webpack.ProvidePlugin
    );

    // Handle plugin already defined
    if (providePlugin) {
        Object.assign(providePlugin.definitions, extUtilsDefinition);
    // Handle not defined -> define
    } else {
        webpackConfig.plugins.push(
            new webpack.ProvidePlugin(extUtilsDefinition)
        );
    }

    return webpackConfig;
};

module.exports = provideGlobals;
