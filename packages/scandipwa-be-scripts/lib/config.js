const path = require('path')

const dirName = path.parse(process.cwd()).name

// docker

// docker network
const dockerNetworkName = `create-scandipwa-app-${dirName}`

// docker volume
const dockerVolumeList = ['mysql-data', 'redis-data', 'elasticsearch-data'].map(v => `${dirName}_${v}`)


// php

// php version
const requiredPHPVersion = '7.3.22'
const requiredPHPVersionRegex = new RegExp(requiredPHPVersion)

// php bin path
const phpBinPath = `~/.phpbrew/php/php-${requiredPHPVersion}/bin/php`

// php extensions
const phpExtensions = ['gd', 'intl']

module.exports = {
    docker: {
        networkName: dockerNetworkName,
        volumeList: dockerVolumeList
    },
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    }
}