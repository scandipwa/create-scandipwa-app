// Inject the actual extensions' imports
const addImportInjectorLoader = (webpackConfig, entryMatcher) => {
    webpackConfig.module.rules.push({
        test: entryMatcher || webpackConfig.entry,
        loader: require.resolve('../../webpack-extension-import-loader')
    });

    return webpackConfig;
};

module.exports = addImportInjectorLoader;
