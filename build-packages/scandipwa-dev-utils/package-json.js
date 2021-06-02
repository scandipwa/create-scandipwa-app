const path = require('path');

/**
 * Get package JSON, or empty object
 *
 * @param {string} pathname
 * @return {object}
 */
const getPackageJson = (pathname, context = process.cwd()) => {
    try {
        const pathToPackageJson = require.resolve(
            path.join(pathname, 'package.json'),
            { paths: [context] }
        );

        return require(pathToPackageJson) || {};
    } catch (e) {
        return {};
    }
};

module.exports = {
    getPackageJson
};
