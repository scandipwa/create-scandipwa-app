/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const webpack = require('webpack');
const fs = require('fs');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FallbackPlugin = require('@scandipwa/webpack-fallback-plugin');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const I18nPlugin = require('@scandipwa/webpack-i18n-plugin');

const {
    ESLINT_MODES,
    whenDev,
    getLoaders,
    loaderByName
} = require('@scandipwa/craco');

const { cracoPlugins } = require('./lib/build-plugins');
const alias = require('./lib/alias');
const when = require('./lib/when');

// we still need Sources for aliases, etc
const { sources } = require('./lib/sources');

const isDev = process.env.NODE_ENV === 'development';

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('src/style/abstract/_abstract.scss');
    const appIndexJs = FallbackPlugin.getFallbackPathname('src/index.js');
    const appHtml = FallbackPlugin.getFallbackPathname('public/index.html');

    // Use ESLint config defined in package.json or fallback to default one
    const eslintConfig = getPackageJson(process.cwd()).eslintConfig || {
        extends: [require.resolve('@scandipwa/eslint-config')]
    };

    // TODO: add legacy i18n support !

    return {
        paths: {
            // Simply fallback to core, this why it's here
            appIndexJs,

            // Assume store-front use normal HTML (defined in /public/index.html)
            appHtml
        },
        eslint: {
            mode: ESLINT_MODES.extends,
            // Ensure we are extending the scandipwa-eslint config
            configure: eslintConfig
        },
        babel: {
            plugins: [
                // Allow BEM props
                'transform-rebem-jsx',
                // Resolve imports like from 'Component/...'
                [
                    'module-resolver', {
                        root: 'src',
                        loglevel: 'silent',
                        alias
                    }
                ]
            ],
            loaderOptions: (babelLoaderOptions) => {
                babelLoaderOptions.presets = [
                    [
                        require.resolve('babel-preset-react-app'),
                        {
                            // for some reason only classic works
                            // the "automatic" does not work
                            runtime: 'classic'
                        }
                    ]
                ];

                return babelLoaderOptions;
            }
        },
        webpack: {
            plugins: [
                // In development mode, provide simple translations and React
                new webpack.ProvidePlugin({
                    React: 'react',
                    // legacy support
                    PureComponent: ['react', 'PureComponent']
                }),

                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                }),

                // Show progress bar when building
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

                // Allow importing .ts and .tsx files without specifying the extension
                webpackConfig.resolve.extensions.push('.ts');
                webpackConfig.resolve.extensions.push('.tsx');

                // Get all babel loaders, make sure they do process not just the src folder
                const {
                    hasFoundAny: hasAnyBabelLoaders,
                    matches: babelLoaders
                } = getLoaders(webpackConfig, loaderByName('babel-loader'));

                if (hasAnyBabelLoaders) {
                    babelLoaders.forEach(({ loader }) => {
                        // Allow everything to be processed by babel
                        loader.include = undefined;
                    });
                }

                const isNewI18n = extensions.some(
                    ({ packageName }) => packageName === '@scandipwa/webpack-i18n-runtime'
                );

                // Include Legacy translations for everyone not using new translations
                if (!isNewI18n) {
                    webpackConfig.plugins.push(new I18nPlugin({
                        locale: process.env.PWA_LOCALE,
                        defaultLocale: 'en_US'
                    }));
                }

                // Allow having empty entry point
                if (isDev) {
                    webpackConfig.entry[1] = appIndexJs;
                } else {
                    webpackConfig.entry = appIndexJs;
                }

                // Disable LICENSE comments extraction in production
                webpackConfig.optimization.minimizer[0].options.extractComments = whenDev(() => true, false);

                // Modify plugins if needed
                webpackConfig.plugins.forEach((plugin) => {
                    if (plugin instanceof MiniCssExtractPlugin) {
                        // Patch mini-css-extract-plugin issue of "Conflicting Order"
                        plugin.options.ignoreOrder = true;
                    }
                });

                return webpackConfig;
            }
        },
        devServer: (devServerConfig, { proxy }) => {
            // initially added by https://github.com/facebook/create-react-app/issues/1676
            // removing X-Forwarded-* headers so Kubernetes won't panic
            // question is - how do they help and why are they needed?
            // maybe they should be ScandiPWA specific?
            proxy[0].xfwd = false;
            return devServerConfig;
        },
        plugins: [
            ...when(
                // if there is no abstract style, do not inject it
                fs.existsSync(abstractStyle),
                [
                    {
                        // Allow using SCSS mix-ins in any file
                        plugin: sassResourcesLoader,
                        options: {
                            resources: abstractStyle
                        }
                    }
                ],
                []
            ),
            ...cracoPlugins
        ]
    };
};
