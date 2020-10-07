const prepareSources = require('./sources');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const path = require('path');

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
const prepareExtensions = () => {
    const rawExtensions = extensions.reduce((acc, { packageName, packagePath }) => (
        { ...acc, [packageName]: packagePath }
    ), {});

    const extensionsSources = prepareSources(rawExtensions);

    Object.defineProperties(extensionsSources, {
        isExtension: {
            enumerable: false,
            get: () => true
        }
    });

    // Add them the same API as for sources
    return extensionsSources;
};

/**
 * Get pathname provisioned by the extension
 *
 * @param {String} pathname - relative pathname
 */
const getExtensionProvisionedPath = (pathname) => {
    for (let j = 0; j < extensions.length; j++) {
        const { packageJson, packagePath } = extensions[j];

        // Take provide field, check if pathname is not available in provisioned names
        const { scandipwa: { provide = [] } = {} } = packageJson;

        for (let i = 0; i < provide.length; i++) {
            // for strings, treat provision as regex, try providing the file match
            if (new RegExp(provide[i]).test(path.normalize(pathname))) {
                // if path is provisioned, resolve to extension
                return {
                    absolutePath: path.join(packagePath, pathname),
                    packagePath
                };
            }
        }
    }

    return {};
};

module.exports = {
    prepareExtensions,
    getExtensionProvisionedPath
};
