const path = require('path');

const { create } = require('@scandipwa/scandipwa-development-toolkit-core');
const { DispatcherType } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

// TODO implement
const getTargetModulePath = () => process.cwd();

const dispatcherTypeMap = {
    no: DispatcherType.NoDispatcher,
    query: DispatcherType.QueryDispatcher,
    regular: DispatcherType.RegularDispatcher
};

const componentCreator = (resourceType) => ({
    name,
    businessLogic = false,
    connected = false,
    dispatcherType
}) => {
    const createdFiles = create(
        resourceType,
        name,
        {
            containerFeatures: {
                logic: businessLogic,
                state: connected
            },
            dispatcherType: dispatcherTypeMap[dispatcherType]
        },
        getTargetModulePath(),
        logger
    );

    if (!createdFiles.length) {
        return;
    }

    logger.note(
        'The following files have been created:',
        ...createdFiles.map(
            (filepath) => logger.style.file(path.relative(process.cwd(), filepath))
        )
    );
};

module.exports = componentCreator;
