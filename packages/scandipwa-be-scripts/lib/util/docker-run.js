const { execAsync } = require('./exec-async');

/**
 * Run docker run command
 * @param {Object} options
 * @param {Array<String>} options.expose
 * @param {Array<String>} options.ports
 * @param {Array<String>} options.mounts
 * @param {Array<String>} options.mountVolumes
 * @param {Object} options.env
 * @param {String} options.image
 * @param {String} options.restart
 * @param {String} options.network
 * @param {String} options.name
 */
const dockerRun = (options) => {
    const {
        expose = [],
        ports = [],
        mounts = [],
        mountVolumes = [],
        env = {},
        image,
        restart,
        network,
        name
    } = options;

    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const exposeArgs = expose.map((port) => `--expose ${ port }`).join(' ');
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const mountVolumesArgs = mountVolumes.map((mount) => `-v ${mount}`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');
    const nameArg = name && `--name ${name}`;

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
        image
    ].filter(Boolean).join(' ');

    return execAsync(dockerCommand);
};

module.exports = dockerRun;
