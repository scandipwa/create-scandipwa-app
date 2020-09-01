/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const webpack = require('webpack');
const path = require('path');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHardDiskPlugin = require('html-webpack-harddisk-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { ESLINT_MODES, whenDev } = require('@scandipwa/craco');
const FallbackPlugin = require('@scandipwa/webpack-fallback-plugin');

const { sources, PROJECT } = require('./lib/sources');
const alias = require('./lib/alias');
const when = require('./lib/when');

// The variable is passed automatically, use --magento flag
const isMagento = process.env.PWA_BUILD_MODE === 'magento';

// The when handler (useful when returning)
const whenMagento = (th, fh) => when(isMagento, th, fh);

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('./src/style/abstract/_abstract.scss', sources);
    const appIndexJs = FallbackPlugin.getFallbackPathname('./src/index.js', sources);
    const appHtml = FallbackPlugin.getFallbackPathname('./public/index.html', sources);

    // TODO: check SWorker

    return {
        paths: {
            // Simply fallback to core, this why it's here
            appIndexJs,

            // For Magento, use Magento_Theme folder as dist
            appBuild: path.join(process.cwd(), ...whenMagento(
                ['Magento_Theme', 'web'],
                ['build']
            )),

            // For Magento use PHP template (defined in /public/index.php)
            // otherwise use normal HTML (defined in /public/index.html)
            appHtml: whenMagento(
                FallbackPlugin.getFallbackPathname('./public/index.php', sources),
                appHtml
            )
        },
        eslint: {
            mode: ESLINT_MODES.extends,
            // Ensure we are extending the scandipwa-eslint config
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
                [
                    'module-resolver', {
                        root: 'src',
                        alias
                    }
                ]
            ]
        },
        webpack: {
            plugins: [
                // In development mode, provide simple translations and React
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

                // Show progress bar when building
                new ProgressBarPlugin(),

                // TODO: implement PHP-based approach for development as Magento theme. See more: https://medium.com/@agent_hunt/how-to-use-index-php-as-the-index-file-with-create-react-app-ff760c910a6a
                // In case it is Magento - we would like to see customization,
                // meta and other things directly from Magento 2 => require
                // disk write for PHP to work with.
                ...whenMagento([new HtmlWebpackHardDiskPlugin()], [])
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

                // Replace .html exclude to .php (otherwise php will compile into /media as file)
                webpackConfig.module.rules[2].oneOf[
                    webpackConfig.module.rules[2].oneOf.length - 1
                ].exclude[1] = whenMagento(/\.php$/, /\.html$/);

                // Allow having empty entry point
                webpackConfig.entry[whenDev(() => 1, 0)] = appIndexJs;

                // Disable LICENSE comments extraction in production
                webpackConfig.optimization.minimizer[0].options.extractComments = whenDev(() => true, false);

                // Modify plugins if needed
                webpackConfig.plugins.reduce((acc, plugin) => {
                    if (plugin instanceof HtmlWebpackPlugin) {
                        // If this is a Magento setup, change output names
                        plugin.options.filename = whenMagento('../templates/root.phtml', 'index.html');
                    } else if (plugin instanceof WorkboxWebpackPlugin.GenerateSW) {
                        // Patch navigate fallback originally references hard-coded index.html
                        plugin.config.navigateFallback = '/';
                    } else if (plugin instanceof MiniCssExtractPlugin) {
                        // Patch mini-css-extract-plugin issue of "Conflicting Order"
                        plugin.options.ignoreOrder = true;
                    }

                    return [...acc, plugin];
                }, []);

                return webpackConfig;
            }
        },
        plugins: [
            {
                // Allow using SCSS mix-ins in any file
                plugin: sassResourcesLoader,
                options: {
                    resources: abstractStyle
                }
            }
        ]
    };
};
