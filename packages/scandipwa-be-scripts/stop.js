/* eslint-disable consistent-return */
const { execAsync } = require('./lib/util/exec-async');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const getRunningContainers = require('./lib/util/get-running-containers');
const { stopPhpFpm } = require('./lib/steps/manage-php-fpm');

const stop = async () => {
    const output = ora();

    const stopPhpFpmOk = await stopPhpFpm({ output });

    if (!stopPhpFpmOk) {
        return false;
    }

    const runningContainers = await getRunningContainers();
    if (runningContainers.length === 0) {
        output.warn('No running containers found. Terminating process...');

        return true;
    }

    try {
        output.start('Stopping containers...');
        await execAsync(`docker container stop ${runningContainers.map((container) => container().name).join(' ')}`);
        output.succeed('Containers stopped successfully!');
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while stopping docker containers',
            'See ERROR log above.'
        );
    }
};

module.exports = stop;
