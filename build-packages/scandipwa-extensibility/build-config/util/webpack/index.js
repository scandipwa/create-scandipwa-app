const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');

/** @type {import('@scandipwa/scandipwa-extensibility').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false
};

const injectWebpackConfig = (
    webpackConfig,
    providedOptions = {}
) => {
    const {
        supportLegacy: isSupportLegacy,
        provideGlobals: isProvideGlobals
    } = Object.assign(defaultOptions, providedOptions);

    injectLoader(webpackConfig);

    if (isProvideGlobals) {
        provideGlobals(webpackConfig);
    }

    if (isSupportLegacy) {
        supportLegacy(webpackConfig);
    }

    return webpackConfig;
};

module.exports = injectWebpackConfig;
