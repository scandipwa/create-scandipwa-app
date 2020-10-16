/* eslint-disable consistent-return */
const { execAsync } = require('./lib/util/exec-async');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const getRunningContainers = require('./lib/util/get-running-containers');

const stop = async () => {
    const runningContainers = await getRunningContainers();
    if (runningContainers.length === 0) {
        ora('No running containers found. Terminating process...').warn();

        return true;
    }
    const output = ora('Stopping containers...').start();

    try {
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
