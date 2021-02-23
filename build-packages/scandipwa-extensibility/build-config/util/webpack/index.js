const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');
const enforceIncludeExtensions = require('./enforce-include-extensions');

/** @type {import('@scandipwa/scandipwa-extensibility').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false,
    disableExcludeWarning: false
};

/**
 * Inject webpack configuration with necessary things for the e11y package
 *
 * @param {any} webpackConfig
 * @param {import('@scandipwa/scandipwa-extensibility').WebpackInjectorConfig} providedOptions
 */
const injectWebpackConfig = (
    webpackConfig,
    providedOptions = {}
) => {
    const {
        supportLegacy: isSupportLegacy,
        provideGlobals: isProvideGlobals,
        disableExcludeWarning: isDisableExcludeWarning,
        webpack,
        entryMatcher
    } = Object.assign(defaultOptions, providedOptions);

    injectLoader(webpackConfig, entryMatcher);
    enforceIncludeExtensions(webpackConfig, isDisableExcludeWarning);

    if (isProvideGlobals) {
        provideGlobals(webpackConfig, webpack);
    }

    if (isSupportLegacy) {
        supportLegacy(webpackConfig);
    }

    return webpackConfig;
};

module.exports = injectWebpackConfig;
