/* eslint-disable max-len */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async-command');
const { docker } = require('../config');
const getRunningContainers = require('../util/get-running-containers');
const dockerVolumeCreate = require('../util/docker-volume-create');
const dockerRun = require('../util/docker-run');

/**
 * Stop docker containers
 * @param {Array<String>} containers container names
 */
const dockerContainerStop = (containers) => execAsync(`docker container stop ${containers.join(' ')}`);

/**
 * Remove docker containers
 * @param {Array<String>} containers container names
 */
const dockerContainerRemove = (containers) => execAsync(`docker container rm ${containers.join(' ')}`);

const deployDockerNetwork = async ({ output }) => {
    try {
        const networkList = await execAsync('docker network ls');

        if (networkList.includes(docker.networkName)) {
            output('Network already deployed');
            return true;
        }

        await execAsync(`docker network create --driver=bridge ${docker.networkName}`);
        logger.log('Network deployed!');
        return true;
    } catch (e) {
        logger.error(e.message);

        logger.error(
            'Unexpected error while deploying docker network.',
            'See ERROR log above.'
        );

        return false;
    }
};

const deployDockerVolumes = async () => {
    try {
        const volumeList = await execAsync('docker volume ls -q');

        const missingVolumes = docker.volumeList
            .filter((volume) => !volumeList.includes(volume.name));

        if (missingVolumes.length > 0) {
            const isPlural = missingVolumes.length > 1;
            logger.warn(`Volume${isPlural ? 's' : ''} ${missingVolumes.map(({ name }) => name).join(', ')} ${isPlural ? 'are' : 'is'} missing. Creating them...`);
            await Promise.all([
                missingVolumes.map((volume) => dockerVolumeCreate(volume))
            ]);
            logger.log('Volumes created');
        } else {
            logger.log('Volumes already created');
        }
    } catch (e) {
        logger.error('Docker deploy volumes error');

        logger.log(e);

        logger.error('Failed to create volumes. See ERROR log above');
        return false;
    }

    return true;
};

const deployDockerContainers = async ({ ports }) => {
    logger.log('Running docker containers');

    try {
        const runningContainers = await getRunningContainers();

        const missingContainers = docker.containerList
            .filter((c) => !runningContainers.some((container) => c().name === container().name));

        if (missingContainers.length > 0) {
            const isPlural = missingContainers.length > 1;
            if (missingContainers.length === runningContainers.length) {
                logger.warn(`Container${isPlural ? 's' : ''} ${missingContainers.map((container) => container().name).join(', ')} ${isPlural ? 'are' : 'is'} missing. Restarting them...`);

                const containersToStop = docker.containerList
                    .filter((container) => !missingContainers.includes(container().name))
                    .map((container) => container().name);

                try {
                    await dockerContainerStop(containersToStop);
                    await dockerContainerRemove(containersToStop);
                } catch (e) {
                    logger.error('Docker containers stop error');

                    logger.log(e);

                    logger.error('Failed to restart containers. See ERROR log above');
                    return false;
                }
            }
        } else {
            logger.log('Containers already running');
            return true;
        }
    } catch (e) {
        logger.error('Docker stop containers error');

        logger.log(e);

        logger.error('Failed to stop containers. See ERROR log above');
        return false;
    }

    logger.log('No containers running, deploying them...');

    try {
        const allContainerList = await execAsync('docker container ls -a');

        const existingContainers = docker.containerList
            .filter((container) => allContainerList.includes(container().name));

        if (existingContainers.length > 0) {
            logger.log('Starting containers...');
            if (existingContainers.length === docker.containerList.length) {
                await Promise.all(existingContainers.map((container) => dockerRun(container({ ports }))));
                logger.log('Containers started up!');
                return true;
            }

            // only some containers are present
            const containersToRun = docker.containerList
                .filter((container) => !allContainerList.includes(container().name));

            await Promise.all(containersToRun.map((container) => dockerRun(container({ ports }))));

            logger.log('Containers started');
            return true;
        }
    } catch (e) {
        logger.error('Docker start containers error');

        logger.log(e);

        logger.error('Failed to start containers. See ERROR log above');
        return false;
    }

    try {
        await Promise.all(docker.containerList.map((container) => dockerRun(container({ ports }))));
    } catch (e) {
        logger.error('Docker deploy containers error');

        logger.log(e);

        logger.error('Failed to create containers. See ERROR log above');
        return false;
    }

    logger.log('Containers deployed');
    return true;
};

const dockerStopContainers = async () => {
    try {
        const runningContainers = await getRunningContainers();

        if (runningContainers.length > 0) {
            logger.log('Stopping docker containers...');
            await dockerContainerStop(runningContainers.map((c) => c().name));
            logger.log('Docker containers stopped');
        } else {
            logger.warn('No containers running');
        }

        return true;
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while stopping docker containers.',
            'See ERROR log above.'
        );

        return false;
    }
};

const dockerRemoveContainers = async () => {
    try {
        const containerList = await execAsync('docker container ls -a');

        const containersToRemove = docker.containerList.filter((container) => containerList.includes(container().name));

        if (containersToRemove.length > 0) {
            logger.log('Removing docker containers...');
            await dockerContainerRemove(containersToRemove.map((c) => c().name));
            logger.log('Docker containers removed');
        } else {
            logger.warn('No containers to remove');
        }

        return true;
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while removing docker containers.',
            'See ERROR log above.'
        );

        return false;
    }
};

const dockerRemoveVolumes = async () => {
    try {
        const volumeList = await execAsync('docker volume ls -q');

        const volumesToRemove = docker.volumeList.filter((volume) => volumeList.includes(volume.name));

        if (volumesToRemove.length > 0) {
            logger.log('Removing volumes...');
            await execAsync(`docker volume rm ${volumesToRemove.map(({ name }) => name).join(' ')}`);
            logger.log('Volumes removed!');
        } else {
            logger.warn('No volumes to remove');
        }

        return true;
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while removing docker volumes.',
            'See ERROR log above.'
        );

        return false;
    }
};

const stopServices = async () => {
    logger.log('Stopping docker services...');

    await dockerStopContainers();

    await dockerRemoveContainers();

    return true;
};

const startServices = async (ports) => {
    logger.log('Deploying docker services...');

    const networkOk = await deployDockerNetwork();

    if (!networkOk) {
        process.exit(1);
    }

    const volumesOk = await deployDockerVolumes();

    if (!volumesOk) {
        await dockerStopContainers();
        process.exit(1);
    }

    const containersOk = await deployDockerContainers({ ports });

    if (!containersOk) {
        await dockerStopContainers();
        await dockerRemoveContainers();
        process.exit(1);
    }
};

const removeServices = async () => {
    await stopServices();
    await dockerRemoveVolumes();
};

module.exports = {
    startServices,
    stopServices,
    removeServices,
    deployDockerNetwork,
    deployDockerVolumes,
    deployDockerContainers
};
