const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const includePaths = require('../common/get-include-paths')();

// TODO what if installed in node_modules?
const locateExtensionFile = (condition) => {
    // Find a path starts with this condition
    if (typeof condition === 'string') {
        return includePaths.find((filepath) => filepath.startsWith(condition));
    }

    // Find a path that when passed to the condition returns true
    if (typeof condition === 'function') {
        return includePaths.find(condition);
    }

    // Find a path that complies to the RegExp given
    if (condition instanceof RegExp) {
        return includePaths.find((filepath) => condition.test(filepath));
    }

    // Find a condition that evaluates to something at the other conditions
    if (Array.isArray(condition)) {
        return condition.find(locateExtensionFile);
    }

    // ? Branching logic here
    if (typeof condition === 'object') {
        // TODO ???
        // For now - ignore objects, they're too tricky
    }

    return false;
};

const babelLoaderMatcher = /babel-loader/;
const isUsableBabel = (usable) => babelLoaderMatcher.test(usable) || babelLoaderMatcher.test(usable.loader);

const isBabel = (rule) => {
    if (babelLoaderMatcher.test(rule.loader)) {
        return true;
    }

    if (!rule.use) {
        return false;
    }

    if (Array.isArray(rule.use)) {
        return !!rule.use.find(isUsableBabel);
    }

    return isUsableBabel(rule.use);
};

const getBabelRules = (rules) => {
    const acc = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const rule of rules) {
        if (rule.oneOf) {
            acc.push(...getBabelRules(rule.oneOf));
        } else if (rule.use || rule.loader) {
            if (isBabel(rule)) {
                acc.push(rule);
            }
        }
    }

    return acc;
};

/**
 * Ensure extensions' files to be transpiled by babel
 * Ensure the project itself to be transpiled by babel
 *
 * @param {object} webpackConfig
 * @param {boolean} isDisableExcludeWarning
 */
const enforceIncludeExtensions = (webpackConfig) => {
    const babelRules = getBabelRules(webpackConfig.module.rules);

    // Handle nothing being transpiled by babel
    // Advise against such approach, endorse introducing babel to the app
    if (!babelRules.length) {
        logger.warn(
            'A rule to transpile code with Babel has not been found in your webpack configuration',
            'Without babel transformations, the plugin system cannot provide any additional syntax',
            `${logger.style.code('@namespace')} magic comments will not work in this setup`,
            'Consider introducing Babel to your application in order to use the functionality like it is intended to be used.'
        );

        return webpackConfig;
    }

    // Handle multiple Babel rules case
    // How to handle this is ambiguous, we'll leave it to the user himself
    // This case should not be encountered frequently
    if (babelRules.length > 1) {
        logger.warn(
            'Multiple Babel rules have been found in your webpack configuration',
            'Please, make sure all the extensions are transpiled by babel',
            'Otherwise, the additional syntax will not be available',
            'You may disable this message by providing the following option to the injector options:',
            logger.style.code('\t"disableExcludeWarning": true')
        );

        return webpackConfig;
    }

    // The most frequent case - 1 babel rule that processes the application
    // Make sure that all the extensions are processed by it
    const [babelRule] = babelRules;
    const excludedExtensionFile = locateExtensionFile(babelRule.exclude);

    if (excludedExtensionFile) {
        logger.error(
            'The following file must be transpiled by babel, but it is not, due to an exclude rule.',
            `Plese make sure that it is transpiled by babel: ${logger.style.file(excludedExtensionFile)}`,
            'You will not see this message when all the extension files are transpiled by Babel.'
        );

        process.exit(1);
    }

    if (!babelRule.include) {
        babelRule.include = [];
    }

    // Ensure all the extensions are included into the transpilation
    babelRule.include.push(...includePaths.map((filepath) => new RegExp(filepath)));

    return webpackConfig;
};

module.exports = enforceIncludeExtensions;
