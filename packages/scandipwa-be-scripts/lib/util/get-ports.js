// TODO: add get-port to package.json
const getPort = require('get-port');

// Map of default ports (key:value)
const defaultPorts = {
    app: 80,
    fpm: 9000,
    mysql: 3306,
    redis: 6379,
    elasticsearch: 9200
};

const getPorts = async () => {
    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(defaultPorts).map(async ([name, port]) => {
            const availablePort = await getPort({ port });
            return [name, availablePort];
        })
    ));

    return availablePorts;
};

module.exports = getPorts;
