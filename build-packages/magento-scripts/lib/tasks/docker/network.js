const { docker } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

const createNetwork = {
    title: 'Deploying docker network',
    task: async (ctx, task) => {
        const networkList = await execAsyncSpawn('docker network ls');

        if (networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }

        await execAsyncSpawn(`docker network create --driver=bridge ${ docker.network.name }`);
    }
};

const removeNetwork = {
    title: 'Remove docker network',
    task: async (ctx, task) => {
        const networkList = await execAsyncSpawn('docker network ls');

        if (!networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }

        await execAsyncSpawn(`docker network rm ${ docker.network.name }`);
    }
};

module.exports = {
    createNetwork,
    removeNetwork
};
