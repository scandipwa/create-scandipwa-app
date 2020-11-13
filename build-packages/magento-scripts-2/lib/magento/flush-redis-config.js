const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const config = require('../config');

module.exports = async (ports) => {
    const { redis: { name } } = config.docker.getContainers(ports);
    await execCommandAsync(`docker exec -t ${ name } redis-cli -h ${ name } -n 0 flushdb`);
    // TODO: handle error
};
