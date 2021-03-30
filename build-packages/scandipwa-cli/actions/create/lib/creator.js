const { create } = require('@scandipwa/scandipwa-development-toolkit-core');
const { DispatcherType } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const invokeGenerator = require('../../../common/invoke-generator');

const dispatcherTypeMap = {
    no: DispatcherType.NoDispatcher,
    query: DispatcherType.QueryDispatcher,
    regular: DispatcherType.RegularDispatcher
};

const creator = (resourceType) => ({
    name,
    container = false,
    redux = false,
    dispatcherType,
    targetModule
}) => {
    invokeGenerator(
        targetModule,
        (resolvedTargetModule) => create(
            resourceType,
            name,
            {
                containerFeatures: {
                    logic: container,
                    state: redux
                },
                dispatcherType: dispatcherTypeMap[dispatcherType]
            },
            resolvedTargetModule,
            logger
        )
    );
};

module.exports = creator;
