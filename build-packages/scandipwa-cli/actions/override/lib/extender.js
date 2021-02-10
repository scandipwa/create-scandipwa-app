const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { extend } = require('@scandipwa/scandipwa-development-toolkit-core');

const userInteraction = require('./util/user-interaction');
const invokeGenerator = require('../../../common/invoke-generator');

const extender = (resourceType) => async ({
    name,
    targetModule = process.cwd(),
    sourceModule
}) => {
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
