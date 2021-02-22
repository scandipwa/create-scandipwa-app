// Inject the actual extensions' imports
const addImportInjectorLoader = (webpackConfig) => {
    webpackConfig.module.rules.push({
        test: webpackConfig.entry,
        loader: require.resolve('../../webpack-extension-import-loader')
    });

    return webpackConfig;
};

module.exports = addImportInjectorLoader;
