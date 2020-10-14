// TODO: add get-port to package.json
const getPort = require('get-port');

// Map of default ports (key:value)
const defaultPorts = {
    appPort: 80,
    fpmPort: 9000,
    mysqlPort: 3306,
    redisPort: 6379,
    ESPort: 9200
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
