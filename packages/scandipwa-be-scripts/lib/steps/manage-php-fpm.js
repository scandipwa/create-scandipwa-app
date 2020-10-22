const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const { php, pidFilePath } = require('../config');
const { execAsync } = require('../util/exec-async-command');
const getProcessId = require('../util/get-process-id');

const stopPhpFpm = async ({ output } = {}) => {
    output = output || ora();
    try {
        const processId = await getProcessId();
        if (processId) {
            output.start('Stopping php-fpm...');
            await execAsync(`kill ${processId} && rm -f ${pidFilePath}`);
            output.succeed('php-fpm stopped!');
        } else {
            output.info('php-fpm is not running');
        }
    } catch (e) {
        if (e.message.includes('No such process')) {
            await execAsync(`rm -f ${pidFilePath}`);
            return true;
        }
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while stopping php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }

    return true;
};

const startPhpFpm = async ({ output } = {}) => {
    output = output || ora();
    await stopPhpFpm({ output });
    output.start('Starting php-fpm...');
    try {
        await execAsync(`${php.phpFpmBinPath} --php-ini ${php.phpIniPath} --fpm-config ${php.phpFpmConfPath} --pid ${pidFilePath} "$@"`);

        output.succeed('php-fpm started up!');
        return true;
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while deploying php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }
};

module.exports = { startPhpFpm, stopPhpFpm };
