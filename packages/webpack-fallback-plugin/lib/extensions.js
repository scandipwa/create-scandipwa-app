import prepareSources from './sources';

/**
 * Extensions available for ScandiPWA Fallback mechanism
 * @typedef {Object} Extensions
 * @extends Sources
 * @property {Bool} isExtension - Is extension source or not
 */

/**
 * Prepare object of extensions, add helper functions
 * @param {} packages
 * @returns {Sources} extensions appended with helper methods
 */
const prepareExtensions = (packages) => {
    const rawExtensions = packages.reduce((acc, package) => {
        try {
            const pathname = require.resolve(`${ package }/package.json`);
            acc[package] = pathname;
        } catch (e) {
            // Ingore the error, the warning had to be generated before
        }

        return acc;
    }, {});

    const extensions = prepareSources(extensions);

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