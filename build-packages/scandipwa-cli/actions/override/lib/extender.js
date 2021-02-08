/* eslint-disable */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { extend, locateScandipwaModule } = require('@scandipwa/scandipwa-development-toolkit-core');
const path = require('path');

const userInteraction = require('./util/user-interaction');

const invokeGenerator = require('../../../common/invoke-generator');
const FallbackPlugin = require('../../../../webpack-fallback-plugin');

const extender = (resourceType) => async ({
    name,
    targetModule = process.cwd()
}) => {
    if (!name) {
        // TODO throw
    }
    
    const expectedResourcePath = path.join('src', resourceType, name);
    const sourceModule = locateScandipwaModule(
        FallbackPlugin.getFallbackPathname(expectedResourcePath)
    );

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
