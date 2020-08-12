const {
    when,
    whenDev,
    whenProd,
    whenTest,
    ESLINT_MODES,
    POSTCSS_MODES
} = require("@craco/craco");

const webpack = require('webpack');
const path = require('path');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const FallbackPlugin = require("./packages/fallback-plugin");

module.exports = function() {
    const abstractStyle = FallbackPlugin.getFallbackPathname('./src/style/abstract/_abstract.scss');
    // const entryPoint = FallbackPlugin.getFallbackPathname('./src/index.js');

    return  {
        eslint: {
            mode: ESLINT_MODES.file
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
                            Type: './src/type/',
                        }
                    }
                ]
            ]
        },
        webpack: {
            plugins: [
                // in development mode, provide simple translations and React
                new webpack.ProvidePlugin({
                    __: path.join(__dirname, './packages/translation-function'),
                    React: 'react'
                }),
                
                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                }),
            ],
            configure: (webpackConfig, { env, paths }) => {
                // Remove module scope plugin, it breaks FallbackPlugin and ProvidePlugin 
                webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                    plugin => plugin.constructor.name !== ModuleScopePlugin.name
                    );
                    
                    // Add FallbackPlugin
                    webpackConfig.resolve.plugins.push(new FallbackPlugin());
                    
                    // Allow importing .style files without specifying the extension
                    webpackConfig.resolve.extensions.push('.scss');

                    const config = [
                        path.join(FallbackPlugin.defaultOptions.fallbackRoot, 'src'),
                        path.join(FallbackPlugin.defaultOptions.projectRoot, 'src'),
                    ];

                    // console.log(config);
                    
                    // Allow any files for loaders
                    webpackConfig.module.rules[1].include = config;
                    webpackConfig.module.rules[2].oneOf[1].include = config;
                                    
                    // Allow having empty entry point 
                    // webpackConfig.entry[whenDev(() => 1, 0)] = entryPoint;

                    return webpackConfig;
                }
            },
            plugins: [
                {
                    // Allow using SCSS mixins in any file
                    plugin: sassResourcesLoader,
                    options: {
                        resources: abstractStyle,
                    },
                },
            ]
        };
    }