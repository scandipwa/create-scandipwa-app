const getPort = require('get-port');
// const path = require('path');
// const { cachePath } = require('../config');
// const pathExists = require('./path-exists');
// const fs = require('fs');

// Map of default ports (key:value)
const defaultPorts = {
    app: 80,
    fpm: 9000,
    mysql: 3306,
    redis: 6379,
    elasticsearch: 9200
};

const getPorts = async () => {
    // const portConfigExists = await pathExists(path.join(cachePath, 'port-config.json'));

    // if (portConfigExists) {
    //     return JSON.parse(await fs.promises.readFile(path.join(cachePath, 'port-config.json'), 'utf8'));
    // }
    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(defaultPorts).map(async ([name, port]) => {
            const availablePort = await getPort({ port });
            return [name, availablePort];
        })
    ));

    return availablePorts;
};

module.exports = getPorts;
