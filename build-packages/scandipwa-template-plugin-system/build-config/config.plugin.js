/* eslint-disable no-param-reassign */

// TODO support any provided template typings

// Load the locale map with import injector
const addTemplatesMiddleware = (config) => {
    config.module.rules.push({
        test: /\.(p?html|php)$/,
        loader: require.resolve('../webpack-template-plugin-loader')
    });
};

const addDefaultHtmlLoader = (config) => {
    config.module.rules.push({
        test: /\.(p?html|php)$/,
        loader: require.resolve('../default-html-loader')
    });
};

module.exports = {
    plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
            // Ensure that the HTML template itself is handled
            // The loader coming from the HtmlWebpackPlugin is disabled from within itself
            // Because "some other" HTML loader (the middleware one) is enabled
            addDefaultHtmlLoader(webpackConfig);

            // Add the loader (middleware) that ensures template plugins
            addTemplatesMiddleware(webpackConfig);

            return webpackConfig;
        }
    }
};
