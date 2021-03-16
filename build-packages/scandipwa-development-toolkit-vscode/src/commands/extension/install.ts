import { installExtension } from '@scandipwa/scandipwa-development-toolkit-core';

import { ActionType } from '../../types';
import { getResourceName } from '../common/options';
import logger from '../../util/logger';

const extensionCreator = async () => {
    const resourceName = await getResourceName('extension', ActionType.Install);

    if (resourceName === '') {
        logger.error('Extension\'s name cannot be empty!');
    }

    if (!resourceName) {
        return;
    }

    installExtension(resourceName, true, logger);
};

export default extensionCreator;