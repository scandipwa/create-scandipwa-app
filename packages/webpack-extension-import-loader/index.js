const path = require('path');
const fs = require('fs');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const isPluginFile = (entry) => /\.plugin\.js$/.test(entry);
const isDirectory = (entry) => !!fs.lstatSync(entry).isDirectory();

/**
 * Retrieve a list of recursively located *.plugin.js files
 * Concat due to a flat structure
 *
 * @param {String} basepath
 */
const findPluginFiles = (basepath) => (
    fs.readdirSync(basepath).reduce((acc, pathname) => {
        const pluginPath = path.join(basepath, pathname);
        const isPlugin = isPluginFile(pluginPath);
        const isDir = isDirectory(pluginPath);

        // We only care about plugin files or directories
        if (!isDir && !isPlugin) {
            return acc;
        }

        // If is plugin - add it to a list
        if (isPlugin) {
            return [
                ...acc,
                pluginPath
            ];
        }

        return [
            ...acc,
            // recursively walk the child directory
            findPluginFiles(pluginPath)
        ];
    }, [])
);

/**
 * Get the list of import declaration strings
 *
 * @param {String} pathname
 */
const getExtensionImports = (pathname) => {
    // TODO: determine why it's needed
    const importAggregator = 'extensions';

    if (!fs.existsSync(pathname)) {
        return '';
    }

    return findPluginFiles(pathname).reduce(
        (singlePluginImportChain, pluginFile) => singlePluginImportChain.concat(
            `${importAggregator}.push(require('${pluginFile}').default);\n`
        ), ''
    );
};

module.exports = function injectImports(source) {
    const rootExtensionImports = getExtensionImports(
        path.join(
            process.cwd(),
            'src',
            'plugin'
        )
    );

    const allExtensionImports = extensions.reduce(
        // eslint-disable-next-line consistent-return,  array-callback-return
        (acc, { packagePath, packageName }) => {
            const pluginDirectory = path.join(
                packagePath,
                'src',
                'plugin'
            );

            if (!fs.existsSync(pluginDirectory)) {
                // Warn and skip plugin from resolution
                logger.warn(
                    `The plugin ${ logger.style.misc(packageName) } has no directory ${ logger.style.file('plugins') }`,
                    'This directory is required for plugin mechanism to work.',
                    'This extension will not participate in plugin resolution.'
                );

                return acc;
            }

            return acc.concat(getExtensionImports(pluginDirectory));
        }, rootExtensionImports
    );

    return source.replace(
        /\/\/ \* ScandiPWA extension importing magic comment! \*\//,
        allExtensionImports
    );
};
