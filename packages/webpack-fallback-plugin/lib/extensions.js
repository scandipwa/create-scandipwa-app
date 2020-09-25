const prepareSources = require('./sources');

/**
 * Extensions available for ScandiPWA Fallback mechanism
 * @typedef {Object} Extensions
 * @extends Sources
 * @property {Bool} isExtension - Is extension source or not
 */

/**
 * Prepare object of extensions, add helper functions
 * 
 * @param {} packages
 * @returns {Extensions} extensions appended with helper methods
 */
const prepareExtensions = (packages) => {
    const rawExtensions = packages.reduce((acc, packageName) => {
        try {
            const pathname = require.resolve(`${ packageName }/package.json`);
            acc[packageName] = pathname;
        } catch (e) {
            // Ingore the error, the warning had to be generated before
        }

        return acc;
    }, {});

    const extensions = prepareSources(rawExtensions);

    Object.defineProperties(extensions, {
        isExtension: {
            enumerable: false,
            get: () => true
        },
    });

    // Add them the same API as for sources
    return extensions;
};

module.exports = prepareExtensions;