const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const config = require('../config');

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

    return execCommandAsync(dockerCommand);
};
const start = async (ports) => {
    const containerList = await execCommandAsync(
        'docker container ls',
        process.cwd(),
        true
    );

    const missingContainers = Object.values(config.docker.getContainers(ports)).filter(
        ({ name }) => !containerList.includes(name)
    );

    if (missingContainers.length <= 0) {
        return;
    }

    // TODO: we might stop containers here ?

    await Promise.all(missingContainers.map((container) => run(container)));
};

const stop = async () => {

};

module.exports = {
    start,
    stop
};
