const path = require('path');
const { getPackageJson } = require('./package-json');
const getPackagePath = require('./package-path');
const shouldUseYarn = require('./should-use-yarn');
const logger = require('./logger');

let visitedDeps = [];

/**
 * Recursively get "extensions" field from all package.json,
 * do the same for all module dependencies.
 *
 * @param {string} modulePath
 * @return {array} an array of object entries.
 */
const getAllExtensions = (modulePath) => {
    if (visitedDeps.indexOf(modulePath) !== -1) {
        return [];
    }

    visitedDeps.push(modulePath);

    const {
        dependencies = {},
        scandipwa: {
            extensions = {}
        } = {}
    } = getPackageJson(modulePath);

    return Object.keys(dependencies).reduce(
        (acc, dependency) => acc.concat(getAllExtensions(dependency)),
        Object.entries(extensions)
    );
};

const getEnabledExtensions = (pathname = process.cwd()) => {
    // reset visited deps, in case it's the second call to this function
    visitedDeps = [];

    // take extensions from scandipwa-scripts
    // this is a workaround, require.resolve('@scandipwa/scandipwa-scripts') does not work
    // probably cyclic dependencies
    const defaultExtensionsSource = path.dirname(
        require.resolve('@scandipwa/scandipwa-scripts/package.json')
    );

    const rootExtensions = getAllExtensions(defaultExtensionsSource);
    const projectExtensions = getAllExtensions(pathname);

    const allExtensions = [...projectExtensions, ...rootExtensions];

    return Array.from(allExtensions.reduceRight(
        // Run reduce backwards - prefer root package declaration
        (acc, [packageName, isEnabled]) => {
            if (isEnabled) {
                acc.add(packageName);
            } else if (acc.has(packageName)) {
                acc.delete(packageName);
            }

            return acc;
        },
        new Set()
    ));
};

/**
 * Extensions available for ScandiPWA Fallback mechanism
 * @typedef {Object} ExtensionObject
 * @property {String} packagePath - path to extension package root
 * @property {Object} packageJson - extension package.json source
 * @property {String} packageName - extension package name
 */

/** @type {*} */
const extensions = getEnabledExtensions().reduce((acc, packageName) => {
    try {
        const packagePath = getPackagePath(packageName);
        const packageJson = getPackageJson(packagePath);

        acc.push({
            packagePath,
            packageName,
            packageJson
        });
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

    return acc;
}, []);

module.exports = extensions;
