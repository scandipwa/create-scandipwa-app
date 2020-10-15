const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const getPorts = require('../util/get-ports')
const { execAsync } = require('../util/exec-async');
const { docker, dirName } = require('../config');
const getRunningContainers = require('../util/get-running-containers');

const dockerRun = (options) => {
    const {
        expose = [],
        ports = [],
        mounts = [],
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
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');
    const nameArg = name && `--name ${name}`

    return execAsync(['docker', 'run', '-d', nameArg, networkArg, restartArg, exposeArgs, portsArgs, mountsArgs, envArgs, image].filter(Boolean).join(' '));
};

const deployDockerNetwork = async ({ output }) => {
    try {
        const networkList = await execAsync('docker network ls')

        if (networkList.includes(docker.networkName)) {
            output.succeed('Network already deployed')
            return true
        }

        await execAsync(`docker network create --driver=bridge ${docker.networkName}`);
        output.succeed('Network deployed!')
        return true
    } catch (e) {
        output.fail(e.message)

        logger.error(
            'Unexpected error while deploying docker network.',
            'See ERROR log above.'
        );

        return false
    }
}

const deployDockerVolumes = async ({ output }) => {
    try {
        const volumeList = await execAsync('docker volume ls')

        const missingVolumes = docker.volumeList.filter(volume => !volumeList.includes(`${dirName}_${volume}`))
        if (missingVolumes.length > 0) {
            const isPlural = missingVolumes.length > 1
            output.warn(`Volume${isPlural ? 's' : ''} ${missingVolumes.join(', ')} ${isPlural ? 'are' : 'is'} missing. Creating them...`)
            await Promise.all([
                missingVolumes.map(volume => execAsync(`docker volume create ${volume}`))
            ]);
            output.succeed('Volumes created!')
        } else {
            output.succeed('Volumes already created')
        }
    } catch (e) {
        output.fail('Docker deploy volumes error');

        logger.log(e)

        logger.error('Failed to create volumes. See ERROR log above');
        return false
    }
    return true
}

const deployDockerContainers = async ({ output, ports }) => {
    output.start('Running docker containers');

    try {
        const containerList = await getRunningContainers()

        const missingContainers = docker.containerList
            .filter(container => !containerList.includes(container().name))

        if (missingContainers.length > 0) {
            const isPlural = missingContainers.length > 1
            if (missingContainers.length === containerList.length) {
                output.warn(`Container${isPlural ? 's' : ''} ${missingContainers.map(container => container().name).join(', ')} ${isPlural ? 'are' : 'is'} missing. Restarting project...`)

                const containersToStop = docker.containerList
                    .filter(container => !missingContainers.includes(container().name))
                    .map(container => container().name)

                await execAsync(`docker container stop ${containersToStop.join(' ')}`)
            } else {
                output.start('No containers running, deploying them...')
            }
        } else {
            output.succeed('Containers already running!')
            return true
        }
    } catch (e) {
        output.fail('Docker stop containers error');

        logger.log(e)

        logger.error('Failed to stop containers. See ERROR log above');
        return false
    }

    try {
        await Promise.all([
            Promise.all(
                [
                // Varnish+Nginx
                dockerRun(docker.container.nginx()),
                dockerRun(docker.container.varnish({ port: ports.app })),
                // Alias - just allows to use different name for service in network,
                // while link links the container to another one (not sure if by name or not)
                // TODO: I think they should run after image creation,
                // execAsync('docker network connect --alias nginx custom-network name_of_nginx_container'),
                // execAsync('docker network connect --link nginx:nginx custom-network varnish')
                ]
            ),
            // Redis
            dockerRun(docker.container.redis({ port: ports.redis })),
            // MySQL
            dockerRun(docker.container.mysql({ port: ports.mysql })),
            // Elasticsearch
            dockerRun(docker.container.elasticsearch({ port: ports.elasticsearch }))
        ]);
    } catch (e) {
        output.fail('Docker deploy containers error');

        logger.log(e)

        logger.error('Failed to create containers. See ERROR log above');
        return false
    }

    output.succeed('Containers deployed successfully!')
    return true
}

const deployServices = async (ports) => {
    const output = ora('Deploying docker services...').start()

    const networkOk = await deployDockerNetwork({ output })

    if (!networkOk) {
        process.exit(1)
    }

    const volumesOk = await deployDockerVolumes({ output })

    if (!volumesOk) {
        process.exit(1)
    }

    const containersOk = await deployDockerContainers({ output, ports })

    if (!containersOk) {
        process.exit(1)
    }

};

module.exports = deployServices;
