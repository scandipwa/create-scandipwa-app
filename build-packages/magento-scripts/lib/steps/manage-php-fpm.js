const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { php, pidFilePath } = require('../config');
const { execAsync } = require('../util/exec-async-command');
const getProcessId = require('../util/get-process-id');

const stopPhpFpm = async () => {
    try {
        const processId = await getProcessId();
        if (processId) {
            logger.log('Stopping php-fpm...');
            await execAsync(`kill ${processId} && rm -f ${pidFilePath}`);
            logger.log('php-fpm stopped!');
        } else {
            logger.warn('php-fpm is not running');
        }
    } catch (e) {
        if (e.message.includes('No such process')) {
            await execAsync(`rm -f ${pidFilePath}`);
            return true;
        }

        logger.error(e);
        logger.error(
            'Unexpected error while stopping php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }

    return true;
};

const startPhpFpm = async () => {
    await stopPhpFpm();
    logger.log('Starting php-fpm...');
    try {
        await execAsync(`${php.phpFpmBinPath} --php-ini ${php.phpIniPath} --fpm-config ${php.phpFpmConfPath} --pid ${pidFilePath} "$@"`);

        logger.log('php-fpm started up!');
        return true;
    } catch (e) {
        logger.error(e);
        logger.error(
            'Unexpected error while deploying php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }
};

module.exports = { startPhpFpm, stopPhpFpm };
