const fs = require('fs');
const path = require('path');
const config = require('../config');
const getPort = require('get-port');

const defaultPorts = {
    app: 80,
    fpm: 9000,
    mysql: 3306,
    redis: 6379,
    elasticsearch: 9200
};

const savePorts = (ports) => {
    fs.writeFileSync(
        path.join(config.config.cacheDir, 'port-config.json'),
        JSON.stringify(ports, null, 4),
        { encoding: 'utf8' }
    );
};

const getPorts = async () => {
    const cachedPorts = fs.existsSync(path.join(config.config.cacheDir, 'port-config.json'));

    if (cachedPorts) {
        return Object.fromEntries(await Promise.all(
            Object.entries(
                JSON.parse(fs.readFileSync(
                    path.join(config.config.cacheDir, 'port-config.json'),
                    'utf8'
                )) // despite we got the port configuration, we still want to make sure ports are free
            ).map(async ([name, port]) => [name, await getPort({ port })])
        ));
    }

    const ports = Object.fromEntries(await Promise.all(
        Object.entries(defaultPorts).map(async ([name, port]) => [name, await getPort({ port })])
    ));

    savePorts(ports);

    return ports;
};

module.exports = {
    savePorts,
    getPorts
};
