/* eslint-disable no-param-reassign */
const {
    deployDockerNetwork,
    deployDockerVolumes,
    deployDockerContainers,
    dockerStopContainers,
    dockerRemoveContainers,
    dockerRemoveVolumes
} = require('../lib/steps/manage-docker-services');
const { checkDocker, getDockerVersion } = require('../lib/steps/install-docker');

exports.deployDockerNetworkTask = {
    title: 'Deploy docker network',
    task: async (ctx, task) => {
        await deployDockerNetwork({
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.deployDockerVolumesTask = {
    title: 'Deploy docker volumes',
    task: async (ctx, subTask) => {
        await deployDockerVolumes({
            output: (t) => {
                subTask.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.deployDockerContainersTask = {
    title: 'Deploy docker containers',
    task: async (ctx, task) => {
        await deployDockerContainers({
            ports: ctx.ports,
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.stopDockerContainersTask = {
    title: 'Stopping containers',
    task: async (ctx, task) => {
        await dockerStopContainers({
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.removeDockerContainersTask = {
    title: 'Removing containers',
    task: async (subCtx, subTask) => {
        await dockerRemoveContainers({
            output: (t) => {
                subTask.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.removeDockerVolumesTask = {
    title: 'Removing volumes',
    task: async (subCtx, subTask) => {
        await dockerRemoveVolumes({
            output: (t) => {
                subTask.output = t;
            }
        });
    }
};

exports.checkDockerInstallTask = {
    title: 'Checking docker',
    task: async (ctx, task) => {
        const dockerOk = await checkDocker();
        if (!dockerOk) {
            throw new Error('Docker is not installed');
        }

        const dockerVersion = await getDockerVersion();

        task.title = `Using docker version ${dockerVersion}`;
    }
};
