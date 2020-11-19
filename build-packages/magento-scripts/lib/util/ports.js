/* eslint-disable no-param-reassign */
const getPort = require('get-port');
const path = require('path');
const fs = require('fs');
const { pathExists } = require('fs-extra');
const { config } = require('../config');

const portConfigPath = path.join(config.cacheDir, 'port-config.json');

const savePortsConfig = async (ports) => {
    await fs.promises.writeFile(
        path.join(config.cacheDir, 'port-config.json'),
        JSON.stringify(ports, null, 2),
        { encoding: 'utf8' }
    );
};

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
const getAvailablePorts = {
    title: 'Get available ports',
    task: async (ctx) => {
        const portConfigExists = await pathExists(portConfigPath);

        if (portConfigExists) {
            const portConfig = JSON.parse(await fs.promises.readFile(portConfigPath, 'utf-8'));

            const ports = Object.fromEntries(await Promise.all(
                Object.entries(portConfig).map(async ([name, port]) => {
                    const availablePort = await getPort({ port });
                    return [name, availablePort];
                })
            ));

            if (ctx.port && ports.app !== ctx.port) {
                throw new Error(`Port ${ctx.port} is not available`);
            }

            ports.app = ctx.port;

            await savePortsConfig(ports);
            ctx.ports = ports;
            return;
        }

        const availablePorts = Object.fromEntries(await Promise.all(
            Object.entries(defaultPorts).map(async ([name, port]) => {
                const availablePort = await getPort({ port });
                return [name, availablePort];
            })
        ));

        if (ctx.port && availablePorts.app !== ctx.port) {
            throw new Error(`Port ${ctx.port} is not available`);
        }

        availablePorts.app = ctx.port;

        await savePortsConfig(availablePorts);
        ctx.ports = availablePorts;
    }
};
/**
 * Get currently using ports
 * @returns {Promise<{app: number, fpm: number, mysql: number, redis: number, elasticsearch: number}>}
 */
const getCachedPorts = {
    task: async () => {
        const portConfigExists = await pathExists(portConfigPath);

        if (portConfigExists) {
            return JSON.parse(await fs.promises.readFile(portConfigPath, 'utf8'));
        }

        return null;
    }
};

module.exports = { getAvailablePorts, getCachedPorts };
