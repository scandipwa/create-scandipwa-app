const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const { appPath, cachePath } = require('./lib/config');
const { removeServices } = require('./lib/steps/manage-docker-services');
const { stopPhpFpm } = require('./lib/steps/manage-php-fpm');
const { execAsync } = require('./lib/util/exec-async-command');
const pathExists = require('./lib/util/path-exists');
const { runMagentoCommandSafe } = require('./lib/util/run-magento');

const cleanUp = async ({ force = false } = {}) => {
    const output = ora('Stopping docker services...').start();
    await removeServices({ output });

    await stopPhpFpm({ output });

    try {
        const cacheExists = await pathExists(cachePath);
        if (cacheExists) {
            output.start('Cleaning cache...');
            await execAsync(`rm -rf ${cachePath}`);
        }
        output.succeed('Cache cleaned!');
    } catch (e) {
        output.fail(e.message);

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
                output.info('Magento is not installed');
            } else {
                await runMagentoCommandSafe('setup:uninstall');
                output.succeed('Magento application uninstalled');
            }

            if (force) {
                output.warn('Removing application directory');
                await execAsync(`rm -rf ${appPath}`);
                output.succeed('Directory removed');
            }
        }
    } catch (e) {
        output.fail(e.message);

        logger.error(e);

        logger.error(
            'Unexpected error while removing app.',
            'See ERROR log above.'
        );
    }

    return true;
};

module.exports = cleanUp;
