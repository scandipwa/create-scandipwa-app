const { getPackageJson } = require('./package-json');

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
            extensions = []
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

    const extensions = getAllExtensions(pathname);

    return Array.from(extensions.reduceRight(
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

module.exports = {
    getEnabledExtensions
};
