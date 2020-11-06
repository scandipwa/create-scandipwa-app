/* eslint-disable no-param-reassign, global-require */
const path = require('path');
const FallbackPlugin = require('@scandipwa/webpack-fallback-plugin');
// const HtmlWebpackHardDiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { sources } = require('@scandipwa/scandipwa-scripts/lib/sources');
const { getLoader, loaderByName } = require('@scandipwa/craco');

// The variable is passed automatically, use --magento flag
const isMagento = process.env.PWA_BUILD_MODE === 'magento';

module.exports = {
    plugin: {
        overrideCracoConfig: ({
            cracoConfig
        }) => {
            if (!isMagento) {
                return cracoConfig;
            }

            // For Magento, use magento/Magento_Theme folder as dist
            cracoConfig.paths.appBuild = path.join(process.cwd(), 'magento', 'Magento_Theme', 'web');

            // For Magento use PHP template (defined in /public/index.php)
            cracoConfig.paths.appHtml = FallbackPlugin.getFallbackPathname('./public/index.php', sources);

            // TODO: implement PHP-based approach for development as Magento theme.
            // See more: https://medium.com/@agent_hunt/how-to-use-index-php-as-the-index-file-with-create-react-app-ff760c910a6a
            // In case it is Magento - we would like to see customization,
            // meta and other things directly from Magento 2 => require
            // disk write for PHP to work with.
            // cracoConfig.webpack.plugins.push(new HtmlWebpackHardDiskPlugin());

            // Always return the config object.
            return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig }) => {
            // For Magento setup, change output file name
            webpackConfig.plugins.forEach((plugin) => {
                if (plugin instanceof HtmlWebpackPlugin) {
                    plugin.options.filename = '../templates/root.phtml';
                    plugin.options.minify = false;
                }
            });

            const { isFound: isFileLoaderFound, match: fileLoader } = getLoader(
                webpackConfig,
                loaderByName('file-loader')
            );

            if (isFileLoaderFound) {
                // Add .php to ignore files (otherwise php will compile into /media as file)
                fileLoader.loader.exclude.push(/\.php$/);
            }

            return webpackConfig;
        }
    }
};
