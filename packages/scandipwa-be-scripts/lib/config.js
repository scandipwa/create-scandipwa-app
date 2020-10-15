const path = require('path')

const dirName = path.parse(process.cwd()).name

const cachePath = path.join(process.cwd(), 'node_modules', '.create-scandipwa-app-cache')

// docker

const dockerServiceName = `create-scandipwa-app-${dirName}`

// docker network
const dockerNetworkName = `${dirName}_network`

// docker volume
const dockerMysqlVolume = `${dirName}_mysql-data`
const dockerRedisVolume = `${dirName}_redis-data`
const dockerElasticsearchVolume = `${dirName}_elasticsearch-data`
// const dockerNginxVolume = `${dirName}_nginx-data`
// const dockerVarnishVolume =`${dirName}_varnish-data`

const dockerVolumeList = [
    dockerMysqlVolume,
    dockerRedisVolume,
    dockerElasticsearchVolume,
    // dockerNginxVolume,
    // dockerVarnishVolume
]

// docker container
// const dockerContainerList = ['nginx', 'varnish', 'redis', 'mysql', 'elasticsearch'].map(c => `${dirName}_${c}`)
const dockerNginxContainer = () => ({
    expose: [80],
    mount: [
        `type=bind,source=${path.join(cachePath, 'nginx')},target=/etc/nginx/conf.d/`],
    restart: 'unless-stopped',
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'nginx:1.18.0',
    name: `${dirName}_nginx`
})

const dockerVarnishContainer = ({ port = 0 } = {}) => ({
    expose: [80],
    ports: [`${port}:80`],
    mount: [`type=bind,source=${path.join(cachePath, 'varnish', 'default.vcl')},target=/etc/varnish/default.vcl`],
    restart: 'unless-stopped',
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'scandipwa/varnish:latest',
    name: `${dirName}_varnish`
})

const dockerRedisContainer = ({ port = 0 } = {}) => ({
    ports: [port],
    mount: [`source=${dockerRedisVolume},target=/data`],
    // TODO: use connect instead
    network:dockerNetworkName,
    image: 'redis:alpine',
    name: `${dirName}_redis`
})

const dockerMysqlContainer = ({ port = 0 } = {}) => ({
    expose: ['3306'],
    ports: [`${port}:3306`],
    mount: [`source=${dockerMysqlVolume},target=/var/lib/mysql`],
    env: {
        MYSQL_PORT: 3306,
        MYSQL_ROOT_PASSWORD: 'scandipwa',
        MYSQL_USER: 'magento',
        MYSQL_PASSWORD: 'magento',
        MYSQL_DATABASE: 'magento'
    },
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'mysql:5.7',
    name: `${dirName}_mysql`
})

const dockerElasticsearchContainer = ({ port = 0 } = {}) => ({
    ports: [`${port}:9200`],
    mount: [`source=${dockerElasticsearchVolume},target=/usr/share/elasticsearch/data`],
    env: {
        'bootstrap.memory_lock': true,
        'xpack.security.enabled': false,
        'discovery.type': 'single-node',
        ES_JAVA_OPTS: '"-Xms512m -Xmx512m"'
    },
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'docker.elastic.co/elasticsearch/elasticsearch:7.6.2',
    name: `${dirName}_elasticsearch`
})

const dockerContainerList = [
    dockerNginxContainer,
    dockerVarnishContainer,
    dockerRedisContainer,
    dockerMysqlContainer,
    dockerElasticsearchContainer
]

// php

// php version
const requiredPHPVersion = '7.3.22'
const requiredPHPVersionRegex = new RegExp(requiredPHPVersion)

// php bin path
const phpBinPath = `~/.phpbrew/php/php-${requiredPHPVersion}/bin/php`

// php extensions
const phpExtensions = ['gd', 'intl']

module.exports = {
    dirName,
    cachePath,
    docker: {
        serviceName: dockerServiceName,
        networkName: dockerNetworkName,
        volumeList: dockerVolumeList,
        containerList: dockerContainerList,
        container: {
            nginx: dockerNginxContainer,
            varnish: dockerVarnishContainer,
            redis: dockerRedisContainer,
            mysql: dockerMysqlContainer,
            elasticsearch: dockerElasticsearchContainer
        }
    },
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    }
}