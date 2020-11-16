const { execAsyncSpawn } = require('../../util/exec-async-command');
const config = require('../config');

module.exports = async (ports, output) => {
    output('Flushing Magento redis cache');
    const { redis: { name } } = config.docker.getContainers(ports);
    const result = await execAsyncSpawn(`docker exec -t ${ name } redis-cli -h ${ name } -n 0 flushdb`);

    if (!result.includes('OK')) {
        throw new Error(`Unexpected output from redis flush command: ${result}`);
    }
};
