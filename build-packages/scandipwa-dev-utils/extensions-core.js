const { getPackageJson } = require('./package-json');
const getPackagePath = require('./package-path');
const shouldUseYarn = require('./should-use-yarn');
const logger = require('./logger');
const memoize = require('memoizee');

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

const getEnabledExtensions = memoize((pathname = process.cwd()) => {
    // reset visited deps, in case it's the second call to this function
    visitedDeps = [];

    const allExtensions = [
        // TODO: validate if this is necessary: by default @scandipwa/scandipwa-scripts is handled
        // all extensions are core extensions + project extensions
        ...getAllExtensions(pathname),
        ...getAllExtensions(getPackagePath('@scandipwa/scandipwa-scripts'))
    ];

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
});

const getExtensionsForCwd = memoize((cwd = process.cwd()) => getEnabledExtensions(cwd).reduce((acc, packageName) => {
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

        process.exit(1);
    }

    return acc;
}, []));

module.exports = {
    getExtensionsForCwd
};
