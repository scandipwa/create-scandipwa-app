/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const {
    php,
    composer,
    magento
} = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

const checkMagentoApp = async () => false; // pathExists(path. appPath);

const installApp = async ({ output }) => {
    output('Creating Magento project...');
    await execAsyncSpawn(
        `${php.binPath} ${composer.binPath} create-project \
        --repository=https://repo.magento.com/ \
        magento/project-community-edition=${magento.version} \
        src`,
        {
            logOutput: true,
            callback: output
        }
    );
    output('Project installed!');
};

const installMagento = async () => {
    logger.log('Checking Composer...');

    const hasMagentoApp = await checkMagentoApp();

    if (!hasMagentoApp) {
        const installAppOk = await installApp();
        if (!installAppOk) {
            throw new Error('application is not installed');
        }
    }

    return true;
};

module.exports = { installMagento, checkMagentoApp, installApp };
