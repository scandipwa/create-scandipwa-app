const path = require('path');

module.exports = (app, config) => {
    const {
        nginx,
        redis,
        mysql,
        elasticsearch
    } = app;

    const {
        prefix,
        magentoDir,
        cacheDir
    } = config;

    const network = {
        name: `${ prefix }_network`
    };

    const volumes = {
        mysql: {
            name: `${ prefix }_mysql-data`
        },
        redis: {
            name: `${ prefix }_redis-data`
        },
        elasticsearch: {
            name: `${ prefix }_elasticsearch-data`
        },
        nginx: {
            name: `${ prefix }_nginx-data`,
            // driver: 'local',
            opts: [
                'type=nfs',
                `device=${ cacheDir }/nginx/conf.d`,
                'o=bind'
            ]
        },
        appPub: {
            name: `${ prefix }_pub-data`,
            opts: [
                'type=nfs',
                `device=${ path.join(magentoDir, 'pub') }`,
                'o=bind'
            ]
        },
        appSetup: {
            name: `${ prefix }_setup-data`,
            opts: [
                'type=nfs',
                `device=${path.join(magentoDir, 'setup')}`,
                'o=bind'
            ]
        }
    };

    const getContainers = (ports) => ({
        nginx: {
            ports: [`${ ports.app }:80`],
            mountVolumes: [
                `${ volumes.nginx.name }:/etc/nginx/conf.d`,
                `${ volumes.appPub.name }:${path.join(magentoDir, 'pub')}`,
                `${ volumes.appSetup.name }:${path.join(magentoDir, 'setup')}`
            ],
            restart: 'on-failure:5',
            // TODO: use connect instead
            network: 'host',
            image: `nginx:${ nginx }`,
            name: `${ prefix }_nginx`
        },
        redis: {
            ports: [`127.0.0.1:${ ports.redis }:6379`],
            mounts: [`source=${ volumes.redis.name },target=/data`],
            // TODO: use connect instead
            network: network.name,
            image: `redis:${ redis }`,
            name: `${ prefix }_redis`
        },
        mysql: {
            ports: [`127.0.0.1:${ ports.mysql }:3306`],
            mounts: [`source=${ volumes.mysql.name },target=/var/lib/mysql`],
            env: {
                MYSQL_PORT: 3306,
                MYSQL_ROOT_PASSWORD: 'scandipwa',
                MYSQL_USER: 'magento',
                MYSQL_PASSWORD: 'magento',
                MYSQL_DATABASE: 'magento'
            },
            network: 'host',
            image: `mysql:${ mysql }`,
            name: `${ prefix }_mysql`
        },
        elasticsearch: {
            ports: [`127.0.0.1:${ ports.elasticsearch }:9200`],
            mounts: [`source=${ volumes.elasticsearch.name },target=/usr/share/elasticsearch/data`],
            env: {
                'bootstrap.memory_lock': true,
                'xpack.security.enabled': false,
                'discovery.type': 'single-node',
                ES_JAVA_OPTS: '"-Xms512m -Xmx512m"'
            },
            network: network.name,
            image: `docker.elastic.co/elasticsearch/elasticsearch:${ elasticsearch }`,
            name: `${ prefix }_elasticsearch`
        }
    });

    return {
        network,
        volumes,
        getContainers
    };
};
