/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
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
    try {
        output.info('Creating Magento project...');
        await execAsyncSpawn(
            // eslint-disable-next-line max-len
            `${phpBinPath} ${composerBinPath} create-project --repository=https://repo.magento.com/ magento/project-community-edition=${appVersion} src`,
            {
                callback: (line) => line.split('\n').forEach((l) => output.info(l))
            }
        );
        output.succeed('Project installed!');
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while installing Magento application.',
            'See ERROR log above.'
        );

        return false;
    }

    return true;
};

const installMagento = async () => {
    const output = ora().info('Checking Composer...');

    const hasMagentoApp = await checkMagentoApp();

    if (!hasMagentoApp) {
        output.warn('Magento application not found, creating...');
        const installAppOk = await installApp({ output });
        if (!installAppOk) {
            return false;
        }
    }

    output.stop();

    return true;
};

module.exports = installMagento;
