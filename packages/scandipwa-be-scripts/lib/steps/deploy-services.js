const path = require('path');
const { execAsync } = require('../exec-async');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const dockerRun = (options) => {
    const {
        expose,
        ports,
        mounts,
        env,
        image,
        restart,
        network
    } = options;

    const restartArg = `--restart ${ restart }`;
    const networkArg = `--network ${ network }`;
    const exposeArgs = expose.map((port) => `--expose ${ port }`).join(' ');
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');

    return execAsync(`docker run -d ${networkArg} ${restartArg} ${exposeArgs} ${portsArgs} ${mountsArgs} ${envArgs} ${image}`);
};

const deployServices = async (ports) => {
    logger.logN('Create network');
    await execAsync('docker network create --driver=bridge custom-network');

    logger.logN('Creating volumes');

    try {
        await Promise.all([
            execAsync('docker volume create mysql-data'),
            execAsync('docker volume create redis-data'),
            execAsync('docker volume create elasticsearch-data')
        ]);
    } catch (e) {
        logger.logN(e);

        logger.error('Faield to create volumes. See ERROR log above');
    }

    logger.logN('Running docker containers');

    await Promise.all([
        Promise.all(
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
                ES_JAVA_OPTS: '-Xms512m -Xmx512m'
            },
            // TODO: use connect instead
            // network: 'custom-network',
            image: 'docker.elastic.co/elasticsearch/elasticsearch:7.6.2'
        })
    ]);
};

module.exports = (ports) => deployServices(ports);
