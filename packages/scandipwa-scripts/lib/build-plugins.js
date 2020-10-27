const path = require('path');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

// Generate aliases for preference first
const {
    cracoPlugins,
    before
} = extensions.reduce((acc, extension) => {
    const {
        before: nextBefore,
        cracoPlugins: nextCracoPlugins
    } = acc;

    const { packageJson, packagePath } = extension;

    // Take provide field, check if pathname is not available in provisioned names
    const {
        name,
        scandipwa: {
            build: {
                before = '',
                cracoPlugins = []
            } = {}
        } = {}
    } = packageJson;

    if (before) {
        const pathname = path.join(packagePath, before);

        try {
            nextBefore.push(require(pathname));
        } catch (e) {
            logger.warn(
                `Failed to load extension\`s ${ logger.style.misc(name) } before-build script.`,
                `Looked for ${ logger.style.file(pathname) } file.`
            );
        }
    }

    for (let i = 0; i < cracoPlugins.length; i++) {
        const pathname = path.join(packagePath, cracoPlugins[i]);

        try {
            nextCracoPlugins.push(require(pathname));
        } catch (e) {
            logger.warn(
                `Failed to load extension\`s ${ logger.style.misc(name) } craco-plugins script.`,
                `Looked for ${ logger.style.file(pathname) } file.`
            );
        }
    }

    return {
        before: nextBefore,
        cracoPlugins: nextCracoPlugins
    };
}, {
    before: [],
    cracoPlugins: []
});

console.log(before, cracoPlugins);

module.exports = {
    before,
    cracoPlugins
};
