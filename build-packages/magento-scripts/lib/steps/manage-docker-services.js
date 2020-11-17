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
        output('Network deployed!');
        return true;
    } catch (e) {
        output(
            'Unexpected error while deploying docker network.',
            'See ERROR log above.'
        );

        return false;
    }
};

const deployDockerVolumes = async ({ output }) => {
    try {
        const volumeList = await execAsync('docker volume ls -q');

        const missingVolumes = docker.volumeList
            .filter((volume) => !volumeList.includes(volume.name));

        if (missingVolumes.length > 0) {
            const isPlural = missingVolumes.length > 1;
            output(`Volume${isPlural ? 's' : ''} ${missingVolumes.map(({ name }) => name).join(', ')} ${isPlural ? 'are' : 'is'} missing. Creating them...`);
            await Promise.all([
                missingVolumes.map((volume) => dockerVolumeCreate(volume))
            ]);
        }
    } catch (e) {
        output('Failed to create volumes. See ERROR log above');

        throw e;
    }
};

const deployDockerContainers = async ({ ports, output }) => {
    try {
        const runningContainers = await getRunningContainers();

        const missingContainers = docker.containerList
            .filter((c) => !runningContainers.some((container) => c().name === container().name));

        if (missingContainers.length > 0) {
            const isPlural = missingContainers.length > 1;
            if (missingContainers.length === runningContainers.length) {
                output(`Container${isPlural ? 's' : ''} ${missingContainers.map((container) => container().name).join(', ')} ${isPlural ? 'are' : 'is'} missing. Restarting them...`);

                const containersToStop = docker.containerList
                    .filter((container) => !missingContainers.includes(container().name))
                    .map((container) => container().name);

                try {
                    await dockerContainerStop(containersToStop);
                    await dockerContainerRemove(containersToStop);
                } catch (e) {
                    output('Failed to restart containers. See ERROR log above');

                    throw e;
                }
            }
        }
    } catch (e) {
        output('Failed to stop containers. See ERROR log above');

        throw e;
    }

    output('No containers running, deploying them...');

    try {
        const allContainerList = await execAsync('docker container ls -a');

        const existingContainers = docker.containerList
            .filter((container) => allContainerList.includes(container().name));

        if (existingContainers.length > 0) {
            output('Starting containers...');
            if (existingContainers.length === docker.containerList.length) {
                await Promise.all(existingContainers.map((container) => dockerRun(container({ ports }))));
                output('Containers started up!');
                return;
            }

            // only some containers are present
            const containersToRun = docker.containerList
                .filter((container) => !allContainerList.includes(container().name));

            await Promise.all(containersToRun.map((container) => dockerRun(container({ ports }))));

            output('Containers started');
        }
    } catch (e) {
        output('Failed to start containers. See ERROR log above');

        throw e;
    }

    try {
        await Promise.all(docker.containerList.map((container) => dockerRun(container({ ports }))));
    } catch (e) {
        output('Failed to create containers. See ERROR log above');

        throw e;
    }

    output('Containers deployed');
};

const dockerStopContainers = async ({ output }) => {
    try {
        const runningContainers = await getRunningContainers();

        if (runningContainers.length > 0) {
            output('Stopping docker containers...');
            await dockerContainerStop(runningContainers.map((c) => c().name));
            output('Docker containers stopped');
        }
    } catch (e) {
        output(
            'Unexpected error while stopping docker containers.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const dockerRemoveContainers = async ({ output }) => {
    try {
        const containerList = await execAsync('docker container ls -a');

        const containersToRemove = docker.containerList.filter(
            (container) => containerList.includes(container().name)
        );

        if (containersToRemove.length > 0) {
            output('Removing docker containers...');
            await dockerContainerRemove(containersToRemove.map((c) => c().name));
            output('Docker containers removed');
        }
    } catch (e) {
        output(
            'Unexpected error while removing docker containers.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const dockerRemoveVolumes = async ({ output }) => {
    try {
        const volumeList = await execAsync('docker volume ls -q');

        const volumesToRemove = docker.volumeList.filter((volume) => volumeList.includes(volume.name));

        if (volumesToRemove.length > 0) {
            output('Removing volumes...');
            await execAsync(`docker volume rm ${volumesToRemove.map(({ name }) => name).join(' ')}`);
            output('Volumes removed!');
        }
    } catch (e) {
        output(
            'Unexpected error while removing docker volumes.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const stopServices = async () => {
    logger.log('Stopping docker services...');

    await dockerStopContainers({ output: logger.log });

    await dockerRemoveContainers({ output: logger.log });

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
    deployDockerContainers,
    dockerStopContainers,
    dockerRemoveContainers,
    dockerRemoveVolumes
};
