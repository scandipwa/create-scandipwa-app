const getPort = require('get-port');
const pathExists = require('./path-exists');
const path = require('path');
const { cachePath } = require('../config');
// const pathExists = require('./path-exists');
const fs = require('fs');

// Map of default ports (key:value)
const defaultPorts = {
    app: 80,
    fpm: 9000,
    mysql: 3306,
    redis: 6379,
    elasticsearch: 9200
};

/**
 * Get available ports on the system
 * @returns {Promise<{app: number, fpm: number, mysql: number, redis: number, elasticsearch: number}>}
 */
const getAvailablePorts = async () => {
    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(defaultPorts).map(async ([name, port]) => {
            const availablePort = await getPort({ port });
            return [name, availablePort];
        })
    ));

    return availablePorts;
};

/**
 * Get currently using ports
 * @returns {Promise<{app: number, fpm: number, mysql: number, redis: number, elasticsearch: number}>}
 */
const getCachedPorts = async () => {
    const portConfigExists = await pathExists(path.join(cachePath, 'port-config.json'));

    if (portConfigExists) {
        return JSON.parse(await fs.promises.readFile(path.join(cachePath, 'port-config.json'), 'utf8'));
    }

    return null;
};

module.exports = { getAvailablePorts, getCachedPorts };
