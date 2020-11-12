const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { appPath, cachePath } = require('./lib/config');
const { removeServices } = require('./lib/steps/manage-docker-services');
const { stopPhpFpm } = require('./lib/steps/manage-php-fpm');
const { execAsync } = require('./lib/util/exec-async-command');
const pathExists = require('./lib/util/path-exists');
const { runMagentoCommandSafe } = require('./lib/util/run-magento');

const cleanUp = async ({ force = false } = {}) => {
    logger.log('Stopping docker services...');
    await removeServices();

    await stopPhpFpm();

    try {
        const cacheExists = await pathExists(cachePath);
        if (cacheExists) {
            logger.log('Cleaning cache...');
            await execAsync(`rm -rf ${cachePath}`);
        }
        logger.log('Cache cleaned!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while removing cache.',
            'See ERROR log above.'
        );

        return false;
    }

    try {
        const appFolderExists = await pathExists(appPath);
        if (appFolderExists) {
            const appInstalled = await runMagentoCommandSafe('setup:db:status');

            if (appInstalled.includes('the Magento application is not installed')) {
                logger.log('Magento is not installed');
            } else {
                await runMagentoCommandSafe('setup:uninstall');
                logger.log('Magento application uninstalled');
            }

            if (force) {
                logger.warn('Removing application directory');
                await execAsync(`rm -rf ${appPath}`);
                logger.log('Directory removed');
            }
        }
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while removing app.',
            'See ERROR log above.'
        );
    }

    return true;
};

module.exports = cleanUp;
