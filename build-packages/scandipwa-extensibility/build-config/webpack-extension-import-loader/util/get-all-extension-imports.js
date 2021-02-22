/* eslint-disable @scandipwa/scandipwa-guidelines/export-level-one */
const path = require('path');
const fs = require('fs');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');

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
    if (!fs.existsSync(pathname)) {
        return [];
    }

    return findPluginFiles(pathname).map(
        (pluginFile) => `require('${pluginFile}').default`
    );
};

module.exports = function getAllExtensionImports() {
    const rootExtensionImports = getExtensionImports(
        path.join(
            process.cwd(),
            'src',
            'plugin'
        )
    );

    const allExtensionImports = extensions.reduce(
        (acc, { packagePath }) => {
            const pluginDirectory = path.join(
                packagePath,
                'src',
                'plugin'
            );

            if (!fs.existsSync(pluginDirectory)) {
                return acc;
            }

            return acc.concat(getExtensionImports(pluginDirectory));
        },
        rootExtensionImports
    );

    return allExtensionImports.join(',\n');
};
