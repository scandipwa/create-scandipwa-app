/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ('OSL') v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullFactory = require('webpack/lib/NullFactory');
const path = require('path');
const fs = require('fs');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const parentThemeHelper = require('@scandipwa/scandipwa-dev-utils/parent-theme');

const addParsedVariableToModule = (parser, name) => {
    if (!parser.state.current.addVariable) {
        return false;
    }

    const pathToTranslationFunction = path.join(__dirname, 'lib/translation-function.js');
    const expression = `require(${ JSON.stringify(pathToTranslationFunction) })`;
    const deps = [];

    parser.parse(expression, {
        current: {
            addDependency: (dep) => {
                // eslint-disable-next-line no-param-reassign
                dep.userRequest = name;
                deps.push(dep);
            }
        },
        module: parser.state.module
    });

    parser.state.current.addVariable(
        name,
        expression,
        deps
    );

    return true;
};

/**
 * Generate error for the after emit logs
 * @param {string} jsonPath
 * @param {object} error
 */
const generateCorruptedJsonError = (jsonPath, error) => ({
    type: 'error',
    args: [
        `Unable to load a translation from ${jsonPath}.`,
        `Error: ${logger.style.misc(error.message)}`
    ]
});

/**
 * @param {object} options object
 * @constructor
 */
class I18nPlugin {
    constructor(options = {}) {
        const { locale } = options;
        this.afterEmitLogs = [];
        this.translationMap = this.loadTranslations(locale);
    }

    loadTranslations(locale) {
        const childTranslation = this.loadChildTranslation(locale);
        const parentTranslations = this.loadTranslationBatch(this.getParentRoots(), locale);
        const extensionTranslations = this.loadTranslationBatch(this.getExtensionRoots(), locale);

        return this.mergeTranslations(childTranslation, parentTranslations, extensionTranslations);
    }

    /**
     * Get and merge all the available translations
     * Merging the translations into one object as follows:
     * All the null values are ignored and do not override anything
     * The first translation that is found gets applied to the application
     * Search sequence:
     *   1. child theme
     *   2. parent themes from youngest ("father") to oldest ("great-great-grandfather")
     *   3. extensions
     * @param {object} childTranslation
     * @param {object[]} parentTranslations
     * @param {object[]} extensionsTranslations
     */
    mergeTranslations(childTranslation, parentTranslations, extensionsTranslations) {
        /* eslint-disable guard-for-in, no-restricted-syntax, no-continue, no-param-reassign */
        // The higher place in this array => the higher the override priority
        const translations = [
            childTranslation,
            ...parentTranslations,
            ...extensionsTranslations
        ].reduce(
            (mergedTranslations, incomingTranslations) => {
                for (const key in incomingTranslations) {
                    // Skip if already translated
                    if (mergedTranslations[key]) {
                        continue;
                    }

                    const incomingValue = incomingTranslations[key];
                    // Override by value if currently translated as `null` => notify!
                    if (mergedTranslations[key] === null && incomingValue !== null) {
                        this.afterEmitLogs.push({
                            type: 'note',
                            args: [
                                `Overriding translation's ${logger.style.code(null)} value for key ${logger.style.code(key)} with ${logger.style.code(incomingValue)}`
                            ]
                        });
                    }

                    // Write the new value into translation object
                    mergedTranslations[key] = incomingValue;
                }

                return mergedTranslations;
            },
            {}
        );

        return translations;
        /* eslint-enable guard-for-in, no-restricted-syntax, no-continue, no-param-reassign */
    }

    getParentRoots() {
        return parentThemeHelper.getParentThemePaths(process.cwd());
    }

    getExtensionRoots() {
        return extensions.map((extension) => extension.packagePath);
    }

    /**
     * Fails silently on MODULE_NOT_FOUND
     * Logs parsing errors to the afterEmitLogs
     * Default value {}
     * @param {string} pathToTry
     */
    loadJson(pathToTry) {
        try {
            return require(pathToTry);
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                this.afterEmitLogs.push(generateCorruptedJsonError(pathToTry, error));
            }

            return {};
        }
    }

    /**
     * Load translation from array of package root paths
     * @param {string[]} packagePaths
     * @param {string} locale
     */
    loadTranslationBatch(packagePaths, locale) {
        return packagePaths.map(
            (packagePath) => this.loadJson(
                path.join(packagePath, 'i18n', `${locale}.json`)
            )
        );
    }

    /**
     * Get the theme's main translation file for the given locale
     * @param {string} locale
     * @returns {object}
     */
    loadChildTranslation(locale) {
        const pathToTry = path.join();
        const absolutePathToTry = path.join(process.cwd(), 'i18n', `${locale}.json`);

        // Handle translation for the given locale exists
        if (fs.existsSync(absolutePathToTry)) {
            return this.loadJson(absolutePathToTry);
        }

        // Handle no translation in child theme
        this.afterEmitLogs.push({
            type: 'note',
            args: [
                `New locale ${ logger.style.misc(locale) } was discovered.`,
                `Created translation file ${ logger.style.file(`.${ path.sep }${ pathToTry }`) }.`,
                `Provide translations for ${ logger.style.misc(locale) } locale there.`
            ]
        });

        writeJson(
            absolutePathToTry,
            {}
        );

        return {};
    }

    apply(compiler) {
        const functionName = '__';
        const plugin = { name: 'I18nPlugin' };
        const missingTranslations = [];

        // save missing translations into JSON
        compiler.hooks.emit.tap(plugin, () => {
            this.appendTranslationsToFiles(missingTranslations);

            setTimeout(() => {
                this.afterEmitLogs.forEach(
                    ({ type, args }) => logger[type](...args)
                );
            }, 100);

            return true;
        });

        // Tap to compilation to later hook into parser to catch calls for translation function
        compiler.hooks.compilation.tap(
            plugin,
            (compilation, { normalModuleFactory }) => {
                compilation.dependencyFactories.set(
                    ConstDependency,
                    new NullFactory()
                );

                compilation.dependencyTemplates.set(
                    ConstDependency,
                    new ConstDependency.Template()
                );

                const handler = (parser) => {
                    parser.hooks.call.for(functionName).tap(plugin, (expr) => {
                        const firstArgument = expr.arguments[0];
                        const param = parser.evaluateExpression(firstArgument);
                        const paramString = param.string;

                        // Replace translation strings
                        const result = this.translationMap[paramString];

                        // Try adding providing variable to JS module
                        if (!addParsedVariableToModule(parser, functionName)) {
                            return false;
                        }

                        // Extract translation if the translated string is missing
                        if (result === undefined) {
                            missingTranslations.push(paramString);
                            return false;
                        }

                        // Skip it, if the result is known, but not translated
                        if (result === null) {
                            return false;
                        }

                        const dep = new ConstDependency(
                            JSON.stringify(result),
                            firstArgument.range
                        );

                        dep.loc = firstArgument.loc;
                        parser.state.current.addDependency(dep);

                        return true;
                    });
                };

                normalModuleFactory.hooks.parser
                    .for('javascript/auto')
                    .tap(plugin, handler);

                normalModuleFactory.hooks.parser
                    .for('javascript/dynamic')
                    .tap(plugin, handler);
            }
        );
    }

    // TODO: add unused, missing translation notification system
    appendTranslationsToFile(filepath, missingTranslations) {
        let existingTranslations;
        try {
            existingTranslations = require(filepath);
        } catch (err) {
            this.afterEmitLogs.push(generateCorruptedJsonError(filepath, err));
            return;
        }

        missingTranslations.forEach((translation) => {
            existingTranslations[translation] = null;
        });

        writeJson(
            filepath,
            existingTranslations
        );
    }

    appendTranslationsToFiles(missingTranslations) {
        const dirname = path.join(process.cwd(), 'i18n');

        fs.readdir(dirname, (err, filenames) => {
            if (err) {
                logger.logN(err);
                return;
            }

            filenames
                .filter((name) => /\.json$/.test(name))
                .map((filename) => path.join(dirname, filename))
                .forEach((filepath) => this.appendTranslationsToFile(filepath, missingTranslations));
        });
    }
}

module.exports = I18nPlugin;
