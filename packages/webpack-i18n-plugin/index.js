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

// TODO: rework it to use JSON imports, so Webpack can track changes on the fly
// TODO: add unused, missing translation notification system

const appendTranslations = (filename, content, missingTranslations) => {
    const translations = content ? JSON.parse(content) : {};

    missingTranslations.forEach((translation) => {
        translations[translation] = null;
    });

    writeJson(
        filename,
        translations
    );
};

const appendTranslationsToFiles = (missingTranslations) => {
    const dirname = path.join(process.cwd(), 'i18n');

    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            logger.logN(err);
            return;
        }

        filenames
            .filter((name) => /\.json$/.test(name))
            .forEach((filename) => {
                const pathToFile = path.join(dirname, filename);

                fs.readFile(pathToFile, 'utf-8', (err, content) => {
                    if (err) {
                        logger.logN(err);
                    } else {
                        appendTranslations(
                            pathToFile,
                            content,
                            missingTranslations
                        );
                    }
                });
            });
    });
};

const addParsedVariableToModule = (parser, name) => {
    if (!parser.state.current.addVariable) {
        return false;
    }

    const pathToTranslationFunction = path.join(__dirname, './lib/translation-function.js');
    const expression = `require('${ pathToTranslationFunction }')`;
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
 * @param {object} options object
 * @constructor
 */
class I18nPlugin {
    constructor(options) {
        const { locale } = options || {};
        this.afterEmitLogs = [];
        this.translationMap = this.loadTranslationJSON(locale);
    }

    loadTranslationJSON(locale) {
        const pathToTry = path.join('i18n', `${locale}.json`);
        const absolutePathToTry = path.join(process.cwd(), pathToTry);

        try {
            return require(absolutePathToTry);
        } catch (e) {
            this.afterEmitLogs.push({
                type: 'note',
                args: [
                    `New locale ${ logger.style.misc(locale) } was discovered.`,
                    `Created translation file ${ logger.style.file(`./${pathToTry}`) }.`,
                    `Provide translations for ${ logger.style.misc(locale) } locale there.`
                ]
            });

            writeJson(
                absolutePathToTry,
                {}
            );

            return {};
        }
    }

    apply(compiler) {
        const functionName = '__';
        const plugin = { name: 'I18nPlugin' };
        const missingTranslations = [];

        // save missing translations into JSON
        compiler.hooks.emit.tap(plugin, () => {
            appendTranslationsToFiles(missingTranslations);

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
}

module.exports = I18nPlugin;
