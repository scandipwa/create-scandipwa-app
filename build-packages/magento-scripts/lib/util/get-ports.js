const getPort = require('get-port');
const pathExists = require('./path-exists');
const { portConfigPath } = require('../config');
const fs = require('fs');
const savePortsConfig = require('./save-ports');

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
    const portConfigExists = await pathExists(portConfigPath);

    if (portConfigExists) {
        const portConfig = JSON.parse(await fs.promises.readFile(portConfigPath, 'utf-8'));

        const ports = Object.fromEntries(await Promise.all(
            Object.entries(portConfig).map(async ([name, port]) => {
                const availablePort = await getPort({ port });
                return [name, availablePort];
            })
        ));

        await savePortsConfig({ ports });

        return ports;
    }

    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(defaultPorts).map(async ([name, port]) => {
            const availablePort = await getPort({ port });
            return [name, availablePort];
        })
    ));

    await savePortsConfig({ ports: availablePorts });

    return availablePorts;
};

/**
 * Get currently using ports
 * @returns {Promise<{app: number, fpm: number, mysql: number, redis: number, elasticsearch: number}>}
 */
const getCachedPorts = async () => {
    const portConfigExists = await pathExists(portConfigPath);

    if (portConfigExists) {
        return JSON.parse(await fs.promises.readFile(portConfigPath, 'utf8'));
    }

    return null;
};

module.exports = { getAvailablePorts, getCachedPorts };
