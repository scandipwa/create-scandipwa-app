const { execAsyncSpawn } = require('../../util/exec-async-command');

const run = (options) => {
    const {
        expose = [],
        ports = [],
        mounts = [],
        mountVolumes = [],
        env = {},
        image,
        restart,
        network,
        name,
        entrypoint
    } = options;

    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const exposeArgs = expose.map((port) => `--expose ${ port }`).join(' ');
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const mountVolumesArgs = mountVolumes.map((mount) => `-v ${mount}`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');
    const nameArg = name && `--name ${name}`;
    const entrypointArg = entrypoint && `--entrypoint "${entrypoint}"`;

    const dockerCommand = [
        'docker',
        'run',
        '-d',
        nameArg,
        networkArg,
        restartArg,
        exposeArgs,
        portsArgs,
        mountsArgs,
        mountVolumesArgs,
        envArgs,
        entrypointArg,
        image
    ].filter(Boolean).join(' ');

    return execAsyncSpawn(dockerCommand);
};

const stop = async (containers) => {
    await execAsyncSpawn(`docker container stop ${containers.join(' ')}`);
    await execAsyncSpawn(`docker container rm ${containers.join(' ')}`);
};

const startContainers = {
    title: 'Starting containers',
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = await execAsyncSpawn('docker container ls');

        const missingContainers = Object.values(docker.getContainers(ports)).filter(
            ({ name }) => !containerList.includes(name)
        );

        if (missingContainers.length === 0) {
            task.skip();
            return;
        }

        // TODO: we might stop containers here ?
        await Promise.all(missingContainers.map((container) => run(container)));
    }
};

const stopContainers = {
    title: 'Stopping containers',
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = await execAsyncSpawn('docker container ls -a');

        const runningContainers = Object.values(docker.getContainers(ports)).filter(
            ({ name }) => containerList.includes(name)
        );

        if (runningContainers.length === 0) {
            task.skip();
            return;
        }

        await stop(runningContainers.map(({ name }) => name));
    }
};

module.exports = {
    startContainers,
    stopContainers
};
