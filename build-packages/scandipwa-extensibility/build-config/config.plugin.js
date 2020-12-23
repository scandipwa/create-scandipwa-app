/* eslint-disable no-param-reassign */

const webpack = require('webpack');

// Inject the runtime helpers into the entry point
const addImportInjectorLoaderHelper = (webpackConfig) => {
    webpackConfig.module.rules.push({
        test: webpackConfig.entry,
        loader: require.resolve('./webpack-extension-import-helper-loader')
    });
};

// Inject the actual extensions' imports
const addImportInjectorLoader = (webpackConfig) => {
    webpackConfig.module.rules.push({
        test: require.resolve('../runtime-helpers/index.js'),
        loader: require.resolve('./webpack-extension-import-loader')
    });
};

// Provide the middleware and Extensible functions globally
const provideGlobals = (webpackConfig) => {
    webpackConfig.plugins.forEach((plugin) => {
        if (plugin instanceof webpack.ProvidePlugin) {
            plugin.definitions.middleware = [require.resolve('../middleware'), 'default'];
            plugin.definitions.Extensible = [require.resolve('../Extensible'), 'default'];
        }
    });
};

const addMiddlewareDecoratorBabelPlugin = (cracoConfig) => {
    cracoConfig.babel.plugins.unshift(
        // Enable 3.x middleware decorators!
        require.resolve('./babel-plugin-middleware-decorator'),

        // Required for extension mechanism to work
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-async-to-generator'
    );
};

module.exports = {
    plugin: {
        overrideCracoConfig: ({ cracoConfig }) => {
            addMiddlewareDecoratorBabelPlugin(cracoConfig);

            return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig }) => {
            addImportInjectorLoaderHelper(webpackConfig);
            addImportInjectorLoader(webpackConfig);
            provideGlobals(webpackConfig);

            return webpackConfig;
        }
    }
};
