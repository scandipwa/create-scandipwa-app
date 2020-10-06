const path = require('path');
const fs = require('fs');
const { getEnabledExtensions } = require('@scandipwa/scandipwa-dev-utils/extensions');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const getPackagePath = require('@scandipwa/scandipwa-dev-utils/package-path');

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

    const allExtensionImports = getEnabledExtensions().reduce(
        // eslint-disable-next-line consistent-return,  array-callback-return
        (acc, packageName) => {
            try {
                const pluginPath = getPackagePath(packageName);

                const pluginDirectory = path.join(
                    pluginPath,
                    'src',
                    'plugin'
                );

                if (!fs.existsSync(pluginDirectory)) {
                    // throw to handle this an exception
                    throw new Error('Plugin not found');
                }

                return acc.concat(getExtensionImports(pluginDirectory));
            } catch (e) {
                const installCommand = shouldUseYarn() ? 'yarn add' : 'npm i';

                logger.logN(e);

                logger.error(
                    `Loading of plugin ${ logger.style.misc(packageName) } failed.`,
                    `Try installing it using ${ logger.style.command(`${ installCommand } ${ packageName } command.`) }`,
                    `Otherwise, disable the extension in the root ${ logger.style.file('package.json') } file:`,
                    `Append ${ logger.style.code(`"${ packageName }": false`) } line to the end of the ${ logger.style.code('scandipwa.extensions') } field.`
                );

                process.exit();
            }
        }, rootExtensionImports
    );

    return source.replace(
        /\/\/ \* ScandiPWA extension importing magic comment! \*\//,
        allExtensionImports
    );
};
