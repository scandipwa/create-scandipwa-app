const path = require('path');

const { create, locateScandipwaModule } = require('@scandipwa/scandipwa-development-toolkit-core');
const { DispatcherType } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const dispatcherTypeMap = {
    no: DispatcherType.NoDispatcher,
    query: DispatcherType.QueryDispatcher,
    regular: DispatcherType.RegularDispatcher
};

const BUBBLE_DEPTH = 5;

const componentCreator = (resourceType) => ({
    name,
    businessLogic = false,
    connected = false,
    dispatcherType,
    targetModule = locateScandipwaModule(process.cwd(), BUBBLE_DEPTH)
}) => {
    if (!targetModule) {
        logger.error(
            `Unable to locate a ScandiPWA module ${logger.style.misc(BUBBLE_DEPTH)} directories up from`,
            logger.style.file(process.cwd()),
            'Please make sure the command is ran in a ScandiPWA module',
            `Or supply a path to a ScandiPWA module by using ${logger.style.command('--target-module [-t]')} flag`
        );

        return;
    }

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
        targetModule,
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
