const path = require('path');
const fs = require('fs');

const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const {
    extend,
    getRelativeResourceDirectory
} = require('@scandipwa/scandipwa-development-toolkit-core');

const locateScandipwaModule = require('@scandipwa/scandipwa-dev-utils/locate-scandipwa-module');

const { ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');

const userInteraction = require('./util/user-interaction');

const invokeGenerator = require('../../../common/invoke-generator');
const FallbackPlugin = require('../../../../webpack-fallback-plugin');

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Returns path to a resource's folder
 * Or to the resource file itself, if a query is given
 *
 * @param {*} resourceName string
 * @param {*} resourceType string
 */
const getFallbackResourcePath = (resourceName, resourceType, sourceModule) => {
    const relativeResourceDirectory = getRelativeResourceDirectory(resourceName, resourceType);

    // If source module is specified explicitly -> use it
    if (sourceModule) {
        return path.join(locateScandipwaModule(sourceModule), relativeResourceDirectory);
    }

    // Queries don't have their own directories
    if (resourceType === ResourceType.Query) {
        const queryName = `${resourceName}.query.js`;
        const queryFilePath = path.join(relativeResourceDirectory, queryName);

        return FallbackPlugin.getFallbackPathname(queryFilePath);
    }

    // If a directory with resource's name exists -> resource exists
    return FallbackPlugin.getFallbackPathname(relativeResourceDirectory);
};

const extender = (resourceType) => async ({
    name,
    targetModule = process.cwd(),
    sourceModule
}) => {
    // Locate the resource to override
    const sourceResourcePath = getFallbackResourcePath(name, resourceType, sourceModule);
    const resolvedSourceModule = locateScandipwaModule(sourceResourcePath);

    // Handle resource falling back to the invoker directory
    if (resolvedSourceModule === targetModule) {
        const resourceIdentifier = [capitalize(resourceType), name].join('/');

        // Exists in the directory => is already created
        if (fs.existsSync(sourceResourcePath)) {
            logger.error(
                `Resource ${logger.style.file(resourceIdentifier)} has already been created!`,
            );
        // Doesn't exist in the directory => doesn't exist at all
        } else {
            logger.error(
                `Resource ${logger.style.file(resourceIdentifier)} does not exist.`,
                `Run the following command to create it: ${logger.style.command(`scandipwa create ${resourceType} ${capitalize(name)}`)}`
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
            resolvedSourceModule,
            logger,
            userInteraction
        )
    );
};

module.exports = extender;
