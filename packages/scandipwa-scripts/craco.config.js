/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const webpack = require('webpack');
const path = require('path');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const { ESLINT_MODES, whenDev } = require('@scandipwa/craco');
const FallbackPlugin = require('@scandipwa/webpack-fallback-plugin');

const PROJECT = 'project';
const CORE = 'core';

const sources = {
    [PROJECT]: process.cwd(),
    [CORE]: path.resolve(require.resolve('@scandipwa/scandipwa/src/index.js'), '../..')
};

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('./src/style/abstract/_abstract.scss', sources);
    const entryPoint = FallbackPlugin.getFallbackPathname('./src/index.js', sources);

    // TODO: check SWorker

    return {
        paths: {
            appIndexJs: entryPoint
        },
        eslint: {
            mode: ESLINT_MODES.extends,
            configure: {
                extends: [
                    require.resolve('@scandipwa/eslint-config')
                ]
            }
        },
        babel: {
            plugins: [
                // Allow BEM props
                'transform-rebem-jsx',
                // Resolve imports like from 'Component/...'
                // TODO: auto-generate
                [
                    'module-resolver', {
                        root: 'src',
                        alias: {
                            Style: './src/style/',
                            Component: './src/component/',
                            Route: './src/route/',
                            Store: './src/store/',
                            Util: './src/util/',
                            Query: './src/query/',
                            Type: './src/type/',
                            SourceStyle: path.join(sources[CORE], './src/style/'),
                            SourceComponent: path.join(sources[CORE], './src/component/'),
                            SourceRoute: path.join(sources[CORE], './src/route/'),
                            SourceStore: path.join(sources[CORE], './src/store/'),
                            SourceUtil: path.join(sources[CORE], './src/util/'),
                            SourceQuery: path.join(sources[CORE], './src/query/'),
                            SourceType: path.join(sources[CORE], './src/type/)')
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
                }),

                new ProgressBarPlugin()
            ],
            configure: (webpackConfig) => {
                // Remove module scope plugin, it breaks FallbackPlugin and ProvidePlugin
                webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                    (plugin) => plugin.constructor.name !== ModuleScopePlugin.name
                );

                // Add FallbackPlugin
                webpackConfig.resolve.plugins.push(new FallbackPlugin({ sources }));

                // Allow importing .style files without specifying the extension
                webpackConfig.resolve.extensions.push('.scss');

                // Allow linter only in project
                webpackConfig.module.rules[1].include = sources[PROJECT];

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
