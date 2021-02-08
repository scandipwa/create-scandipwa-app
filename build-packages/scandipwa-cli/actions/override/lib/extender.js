const path = require('path');
const fs = require('fs');

const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const {
    extend,
    locateScandipwaModule,
    getRelativeResourceDirectory
} = require('@scandipwa/scandipwa-development-toolkit-core');

const { ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');

const userInteraction = require('./util/user-interaction');

const invokeGenerator = require('../../../common/invoke-generator');
const FallbackPlugin = require('../../../../webpack-fallback-plugin');

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const resourceExists = (resourceType, resourceName, resourceDirectory) => {
    // Queries don't have subdirectories
    if (resourceType === ResourceType.Query) {
        return fs.existsSync(path.join(resourceDirectory, `${resourceName}.query.js`))
            || fs.existsSync(path.join(resourceDirectory, `${resourceName}.query.ts`));
    }

    // Component dir exists => resource exists
    return fs.existsSync(resourceDirectory);
};

const extender = (resourceType) => async ({
    name,
    targetModule = process.cwd()
}) => {
    const expectedResourceDirectory = getRelativeResourceDirectory(name, resourceType);
    const sourceResourceDirectoryPath = FallbackPlugin.getFallbackPathname(expectedResourceDirectory);
    const sourceModule = locateScandipwaModule(sourceResourceDirectoryPath);

    // Handle resource not found
    if (sourceModule === targetModule) {
        const resourceIdentifier = [capitalize(resourceType), name].join('/');

        // Resource does not exist
        if (!resourceExists(resourceType, name, sourceResourceDirectoryPath)) {
            logger.error(
                `Resource ${logger.style.file(resourceIdentifier)} does not exist.`,
                `Use ${logger.style.command('scandipwa create')} command to create new resources.`
            );
        } else {
        // Resource is already overridden
            logger.error(
                `Resource ${logger.style.file(resourceIdentifier)} has already been created!`,
            );
        }

        return;
    }

    await invokeGenerator(
        targetModule,
        (resolvedTargetModule) => extend(
            resourceType,
            name,
            resolvedTargetModule,
            sourceModule,
            logger,
            userInteraction
        )
    );
};

module.exports = extender;
