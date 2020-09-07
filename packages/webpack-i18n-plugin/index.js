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

/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */

const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullFactory = require('webpack/lib/NullFactory');
const path = require('path');
const fs = require('fs');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const appendTranslations = (filename, content, missingTranslations) => {
    const translations = content ? JSON.parse(content) : {};

    missingTranslations.forEach((translation) => {
        translations[translation] = null;
    });

    fs.writeFileSync(
        filename,
        JSON.stringify(
            translations,
            null,
            4
        )
    );
};

const appendTranslationsToFiles = (missingTranslations) => {
    const dirname = path.join(process.cwd(), 'i18n');

    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            console.log(err);
            return;
        }

        filenames
            .filter(name => /\.json$/.test(name))
            .forEach((filename) => {
                const pathToFile = path.join(dirname, filename);

                fs.readFile(pathToFile, 'utf-8', (err, content) => {
                    if (err) {
                        console.log(err);
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

    const expression = `require('${path.join(
        __dirname,
        '../translation-function'
    )}')`;

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

    parser.state.current.addVariable(name, expression, deps);

    return true;
};

/**
 * @param {object} options object
 * @constructor
 */
class I18nPlugin {
    constructor(options) {
        const { locale } = options || {};
        this.translationMap = this.loadTranslationJSON(locale)
    }

    loadTranslationJSON(locale) {
        const pathToTry = path.join('i18n', `${locale}.json`);
        const absolutePathToTry = path.join(process.cwd(), pathToTry);

        try {
            return require(absolutePathToTry);
        } catch (e) {
            logger.note(
                `New locale ${ logger.style.misc(locale) } is discovered.`,
                `Creating translation file ${ logger.style.file(`./${pathToTry}`) }.`,
                `Provide translations for ${ logger.style.misc(locale) } locale there.`
            );

            fs.writeFileSync(absolutePathToTry, JSON.stringify({}, undefined, 4));
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

                        // Extract translation if the translated string
                        // is missing, do nothing translation function
                        if (!result) {
                            missingTranslations.push(paramString);

                            return true;
                        }

                        if (!addParsedVariableToModule(parser, functionName)) {
                            return false;
                        }

                        if (result) {
                            const dep = new ConstDependency(
                                JSON.stringify(result),
                                firstArgument.range
                            );

                            dep.loc = firstArgument.loc;
                            parser.state.current.addDependency(dep);
                            return true;
                        }

                        return false;
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
