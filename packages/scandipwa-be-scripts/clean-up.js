const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const { docker } = require('./lib/config');
const { execAsync } = require('./lib/util/exec-async');
const getRunningContainers = require('./lib/util/get-running-containers');
const pathExists = require('./lib/util/path-exists');

const cleanUp = async () => {
    const output = ora('Checking services...').start();
    try {
        const runningContainers = await getRunningContainers();

        if (runningContainers.length > 0) {
            output.start('Stopping docker containers...');
            await execAsync(`docker container stop ${runningContainers.map((c) => c().name).join(' ')}`);
            output.succeed('Docker containers stopped!');
        } else {
            output.warn('No containers running!');
        }
    } catch (e) {
        output.fail(e.message);

        logger.error(e);

        logger.error(
            'Unexpected error while stopping docker containers.',
            'See ERROR log above.'
        );

        return false;
    }

    try {
        const containerList = await execAsync('docker container ls -a');

        const containersToRemove = docker.containerList.filter((container) => containerList.includes(container().name));

        if (containersToRemove.length > 0) {
            output.start('Removing docker containers...');
            await execAsync(`docker container rm ${containersToRemove.map((c) => c().name).join(' ')}`);
            output.succeed('Docker containers removed!');
        } else {
            output.warn('No containers to remove');
        }
    } catch (e) {
        output.fail(e.message);

        logger.error(e);

        logger.error(
            'Unexpected error while removing docker containers.',
            'See ERROR log above.'
        );

        return false;
    }

    try {
        const volumeList = await execAsync('docker volume ls -q');

        const volumesToRemove = docker.volumeList.filter((volume) => volumeList.includes(volume.name));

        if (volumesToRemove.length > 0) {
            output.start('Removing volumes...');
            await execAsync(`docker volume rm ${volumesToRemove.map(({ name }) => name).join(' ')}`);
            output.succeed('Volumes removed!');
        } else {
            output.warn('No volumes to remove');
        }
    } catch (e) {
        output.fail(e.message);

        logger.error(e);

        logger.error(
            'Unexpected error while removing docker volumes.',
            'See ERROR log above.'
        );

        return false;
    }

    try {
        const cacheExists = await pathExists('node_modules/.create-scandipwa-app-cache');
        if (cacheExists) {
            output.start('Cleaning cache...');
            await execAsync('rm -rf node_modules/.create-scandipwa-app-cache');
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
        const appFolderExists = await pathExists('app');
        if (appFolderExists) {
            output.start('Removing app...');
            await execAsync('rm -rf app');
        }
        output.succeed('App removed!');
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
