const prepareSources = require('./sources');
const { getExtensionsForCwd } = require('@scandipwa/scandipwa-dev-utils/extensions-core');

const logger = require('@scandipwa/scandipwa-dev-utils/logger');
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
const prepareExtensions = (processRoot) => {
    const rawExtensions = getExtensionsForCwd(processRoot).reduce((acc, { packageName, packagePath }) => (
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
const getExtensionProvisionedPath = (pathname, cwd) => {
    const extensions = getExtensionsForCwd(cwd);

    for (let j = 0; j < extensions.length; j++) {
        const { packageJson, packagePath } = extensions[j];

        // Take provide field, check if pathname is not available in provisioned names
        const {
            name,
            scandipwa: {
                provide = [],
                preference = ''
            } = {},
            main
        } = packageJson;

        if (preference) {
            const moduleIndex = pathname.indexOf(preference);

            if (moduleIndex !== -1) {
                const relativePathname = pathname.slice(moduleIndex + preference.length);

                if (path.normalize(relativePathname) === '.') {
                    if (!main) {
                        logger.error(
                            `The import of preferenced module ${ logger.style.misc(name) } failed.`,
                            'Trying to import module\'s entrypoint.',
                            `Searched for ${ logger.style.misc('main') } field in ${ logger.style.misc(name) }'s ${ logger.style.file('packge.json') }. None found.`,
                            `Make sure ${ logger.style.misc(name) } has an entrypoint defined in ${ logger.style.file('packge.json') }.`,
                            'Alternatively, provide the relative path to module\'s file.'
                        );

                        process.exit(1);
                    }

                    return {
                        absolutePath: path.join(packagePath, main),
                        relativePath: path.normalize(main),
                        packagePath
                    };
                }

                return {
                    absolutePath: path.join(packagePath, relativePathname),
                    relativePath: path.normalize(relativePathname),
                    packagePath
                };
            }
        }

        for (let i = 0; i < provide.length; i++) {
            // for strings, treat provision as regex, try providing the file match
            if (path.normalize(provide[i]) === path.normalize(pathname)) {
                // if path is provisioned, resolve to extension
                return {
                    absolutePath: path.join(packagePath, pathname),
                    relativePath: pathname,
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
