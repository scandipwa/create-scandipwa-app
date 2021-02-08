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

/**
 * Returns path to a resource's folder
 * Or to the resource file itself, if a query is given
 *
 * @param {*} resourceName string
 * @param {*} resourceType string
 */
const getFallbackResourcePath = (resourceName, resourceType) => {
    const relativeResourceDirectory = getRelativeResourceDirectory(resourceName, resourceType);

    if (resourceType === ResourceType.Query) {
        const queryName = `${resourceName}.query.js`;
        const queryFilePath = path.join(relativeResourceDirectory, queryName);

        return FallbackPlugin.getFallbackPathname(queryFilePath);
    }

    return FallbackPlugin.getFallbackPathname(relativeResourceDirectory);
};

const extender = (resourceType) => async ({
    name,
    targetModule = process.cwd()
}) => {
    const sourceResourcePath = getFallbackResourcePath(name, resourceType);
    const sourceModule = locateScandipwaModule(sourceResourcePath);

    // Handle resource falling back to the invoker directory
    if (sourceModule === targetModule) {
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
            sourceModule,
            logger,
            userInteraction
        )
    );
};

module.exports = extender;
