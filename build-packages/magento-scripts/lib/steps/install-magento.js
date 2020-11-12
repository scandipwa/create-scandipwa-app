/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const {
    php: { phpBinPath },
    composer: { composerBinPath },
    appVersion,
    appPath
} = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');
const pathExists = require('../util/path-exists');

const checkMagentoApp = async () => pathExists(appPath);

const installApp = async ({ output }) => {
    // try {
    output('Creating Magento project...');
    await execAsyncSpawn(
        // eslint-disable-next-line max-len
        `${phpBinPath} ${composerBinPath} create-project --repository=https://repo.magento.com/ magento/project-community-edition=${appVersion} src`,
        {
            logOutput: true,
            callback: output
        }
    );
    output('Project installed!');
    // } catch (e) {
    //     logger.error(e);
    //     logger.error(
    //         'Unexpected error while installing Magento application.',
    //         'See ERROR log above.'
    //     );

    //     return false;
    // }

    // return true;
};

const installMagento = async () => {
    logger.log('Checking Composer...');

    const hasMagentoApp = await checkMagentoApp();

    if (!hasMagentoApp) {
        // logger.warn('Magento application not found, creating...');
        const installAppOk = await installApp();
        if (!installAppOk) {
            throw new Error('application is not installed');
        }
    }

    return true;
};

module.exports = { installMagento, checkMagentoApp, installApp };
