const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const { docker } = require('../config');

const createNetwork = {
    title: 'Deploying docker network',
    task: async (ctx, task) => {
        const networkList = await execCommandAsync(
            'docker network ls',
            process.cwd(),
            true
        );

        if (networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }

        await execCommandAsync(`docker network create --driver=bridge ${ docker.network.name }`);
    }
};

const removeNetwork = {
    title: 'Remove docker network',
    task: async (ctx, task) => {
        const networkList = await execCommandAsync(
            'docker network ls',
            process.cwd(),
            true
        );

        if (!networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }

        await execCommandAsync(`docker network rm ${ docker.network.name }`);
    }
};

module.exports = {
    createNetwork,
    removeNetwork
};
