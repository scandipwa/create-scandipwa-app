const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const getPorts = require('../util/get-ports')
const { execAsync } = require('../util/exec-async');
const { docker } = require('../config')

const dockerRun = (options) => {
    const {
        expose = [],
        ports = [],
        mounts = [],
        env = {},
        image,
        restart,
        network
    } = options;

    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const exposeArgs = expose.map((port) => `--expose ${ port }`).join(' ');
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');

    return execAsync(['docker', 'run', '-d', networkArg, restartArg, exposeArgs, portsArgs, mountsArgs, envArgs, image].filter(Boolean).join(' '));
};

const deployDockerNetwork = async ({ output }) => {
    // const output = ora('Deploying network...').start()
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

        const missingVolumes = docker.volumeList.filter(volume => !volumeList.includes(volume))
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

const deployDockerContainers = async ({ output }) => {
    output.start('Running docker containers');

    const ports = await getPorts();

    try {
        await Promise.all([
            Promise.all(
                [
                // Varnish+Nginx
                dockerRun({
                    expose: [80],
                    mount: [`type=bind,source=${ path.join(process.cwd(), 'node_modules', '.cache', 'nginx') },target=/etc/nginx/conf.d/`],
                    restart: 'unless-stopped',
                    // TODO: use connect instead
                    // network: 'custom-network',
                    image: 'nginx:1.18.0'
                }),
                dockerRun({
                    expose: [80],
                    ports: [`${ports.appPort}:80`],
                    mount: [
                        `type=bind,
                        source=${ path.join(process.cwd(), 'node_modules', '.cache', 'varnish', 'default.vcl') },
                        target=/etc/varnish/default.vcl`
                    ],
                    restart: 'unless-stopped',
                    // TODO: use connect instead
                    // network: 'custom-network',
                    image: 'scandipwa/varnish:latest'
                }),
                // Alias - just allows to use different name for service in network,
                // while link links the container to another one (not sure if by name or not)
                // TODO: I think they should run after image creation,
                // execAsync('docker network connect --alias nginx custom-network name_of_nginx_container'),
                // execAsync('docker network connect --link nginx:nginx custom-network varnish')
                ]
            ),
            // Redis
            dockerRun({
                ports: [`${ports.redisPort}`],
                mount: ['source=redis-data,target=/data'],
                // TODO: use connect instead
                // network: 'custom-network',
                image: 'redis:alpine'
            }),
            // MySQL
            dockerRun({
                expose: ['3306'],
                ports: [`${ports.mysqlPort}:3306`],
                mount: ['source=mysql-data,target=/var/lib/mysql'],
                env: {
                    MYSQL_PORT: 3306,
                    MYSQL_ROOT_PASSWORD: 'scandipwa',
                    MYSQL_USER: 'magento',
                    MYSQL_PASSWORD: 'magento',
                    MYSQL_DATABASE: 'magento'
                },
                // TODO: use connect instead
                // network: 'custom-network',
                image: 'mysql:5.7'
            }),
            // Elasticsearch
            dockerRun({
                ports: [`${ports.ESPort}:9200`],
                mount: ['source=elasticsearch-data,target=/usr/share/elasticsearch/data'],
                env: {
                    'bootstrap.memory_lock': true,
                    'xpack.security.enabled': false,
                    'discovery.type': 'single-node',
                    ES_JAVA_OPTS: '"-Xms512m -Xmx512m"'
                },
                // TODO: use connect instead
                // network: 'custom-network',
                image: 'docker.elastic.co/elasticsearch/elasticsearch:7.6.2'
            })
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
