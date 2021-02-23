const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const extUtilsDefinition = {
    ExtUtils: [
        '@scandipwa/scandipwa-extensibility/ExtUtils',
        'default'
    ]
};

/**
 * Provide ExtUtils globally
 *
 * @param {object} webpackConfig
 * @param {object} webpack
 */
const provideGlobals = (webpackConfig, webpack) => {
    const providePlugin = webpackConfig.plugins.find(
        (one) => one instanceof webpack.ProvidePlugin
    );

    // Handle plugin already defined
    if (providePlugin) {
        Object.assign(providePlugin.definitions, extUtilsDefinition);

    // Handle not defined -> define
    } else {
        if (!webpack) {
            logger.error(
                'Webpack injection has been triggered, but webpack cannot be found',
                'Please provide webpack in the injector\'s options'
            );

            process.exit(1);
        }

        webpackConfig.plugins.push(
            new webpack.ProvidePlugin(extUtilsDefinition)
        );
    }

    return webpackConfig;
};

module.exports = provideGlobals;
