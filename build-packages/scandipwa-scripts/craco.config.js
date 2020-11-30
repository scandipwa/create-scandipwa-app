/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FallbackPlugin = require('@scandipwa/webpack-fallback-plugin');
const I18nPlugin = require('@scandipwa/webpack-i18n-plugin');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const escapeRegex = require('@scandipwa/scandipwa-dev-utils/escape-regex');

const {
    ESLINT_MODES,
    whenDev,
    getLoaders,
    loaderByName
} = require('@scandipwa/craco');

const { cracoPlugins } = require('./lib/build-plugins');
const { sources } = require('./lib/sources');
const alias = require('./lib/alias');
const when = require('./lib/when');

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('src/style/abstract/_abstract.scss', sources);
    const appIndexJs = FallbackPlugin.getFallbackPathname('src/index.js', sources);
    const appHtml = FallbackPlugin.getFallbackPathname('public/index.html', sources);

    // TODO: check SWorker

    // Use ESLint config defined in package.json or fallback to default one
    const eslintConfig = getPackageJson(process.cwd()).eslintConfig || {
        extends: [require.resolve('@scandipwa/eslint-config')]
    };

    return {
        paths: {
            // Simply fallback to core, this why it's here
            appIndexJs,

            // Assume we are store-front, build into build
            appBuild: path.join(process.cwd(), 'build'),

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
                // Enable 3.x middleware decorators
                '@scandipwa/babel-plugin-middleware-decorator',
                // Required for extension mechanism to work
                '@babel/plugin-transform-arrow-functions',
                '@babel/plugin-transform-async-to-generator',
                // Resolve imports like from 'Component/...'
                [
                    'module-resolver', {
                        root: 'src',
                        loglevel: 'silent',
                        alias
                    }
                ]
            ]
        },
        webpack: {
            plugins: [
                // In development mode, provide simple translations and React
                new webpack.ProvidePlugin({
                    React: 'react',
                    middleware: [require.resolve('@scandipwa/scandipwa-extensibility/middleware'), 'default'],
                    Extensible: [require.resolve('@scandipwa/scandipwa-extensibility/Extensible'), 'default']
                }),

                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                }),

                // Show progress bar when building
                new ProgressBarPlugin(),

                new I18nPlugin({ locale: process.env.PWA_LOCALE })
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
                        // TODO: compose a list of known location, process only those
                        loader.include = undefined;
                    });
                }

                // Inject extension import loader
                webpackConfig.module.rules.push({
                    test: new RegExp(escapeRegex(path.join('util', 'Extensions', 'index.js'))),
                    loader: '@scandipwa/webpack-extension-import-loader'
                });

                // Allow having empty entry point
                webpackConfig.entry[whenDev(() => 1, 0)] = appIndexJs;

                // Disable LICENSE comments extraction in production
                webpackConfig.optimization.minimizer[0].options.extractComments = whenDev(() => true, false);

                // Modify plugins if needed
                webpackConfig.plugins.forEach((plugin) => {
                    if (plugin instanceof WorkboxWebpackPlugin.GenerateSW) {
                        // Patch navigate fallback originally references hard-coded index.html
                        plugin.config.navigateFallback = path.sep;
                    } else if (plugin instanceof MiniCssExtractPlugin) {
                        // Patch mini-css-extract-plugin issue of "Conflicting Order"
                        plugin.options.ignoreOrder = true;
                    }
                });

                return webpackConfig;
            }
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
