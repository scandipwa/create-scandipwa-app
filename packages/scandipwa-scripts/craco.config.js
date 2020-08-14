/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const { ESLINT_MODES, whenDev } = require('@scandipwa/craco');
const webpack = require('webpack');
const path = require('path');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const FallbackPlugin = require('../webpack-fallback-plugin'); // TODO: replace with dependency

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('./src/style/abstract/_abstract.scss');
    const entryPoint = FallbackPlugin.getFallbackPathname('./src/index.js');

    // TODO: check SWorker

    return {
        paths: {
            appIndexJs: entryPoint
        },
        eslint: {
            mode: ESLINT_MODES.extends
        },
        babel: {
            plugins: [
                // Allow BEM props
                'transform-rebem-jsx',
                // Resolve imports like from 'Component/...'
                [
                    'module-resolver', {
                        root: './',
                        alias: {
                            Style: './src/style/',
                            Component: './src/component/',
                            Route: './src/route/',
                            Store: './src/store/',
                            Util: './src/util/',
                            Query: './src/query/',
                            Type: './src/type/'
                        }
                    }
                ]
            ]
        },
        webpack: {
            plugins: [
                // in development mode, provide simple translations and React
                new webpack.ProvidePlugin({
                    __: path.join(__dirname, '../webpack-i18n-plugin/translation-function'), // TODO: replace with dependency
                    React: 'react'
                }),

                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                })
            ],
            configure: (webpackConfig) => {
                // Remove module scope plugin, it breaks FallbackPlugin and ProvidePlugin
                webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                    (plugin) => plugin.constructor.name !== ModuleScopePlugin.name
                );

                // Add FallbackPlugin
                webpackConfig.resolve.plugins.push(new FallbackPlugin());

                // Allow importing .style files without specifying the extension
                webpackConfig.resolve.extensions.push('.scss');

                // Allow linter only in project
                webpackConfig.module.rules[1].include = FallbackPlugin.defaultOptions.projectRoot;

                // Allow everything to processed by babel
                webpackConfig.module.rules[2].oneOf[1].include = undefined;

                // Allow having empty entry point
                webpackConfig.entry[whenDev(() => 1, 0)] = entryPoint;

                return webpackConfig;
            }
        },
        plugins: [
            {
                // Allow using SCSS mixins in any file
                plugin: sassResourcesLoader,
                options: {
                    resources: abstractStyle
                }
            }
        ]
    };
};
