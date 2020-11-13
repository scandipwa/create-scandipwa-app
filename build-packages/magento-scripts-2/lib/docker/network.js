const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const config = require('../config');

const start = async () => {
    const networkList = await execCommandAsync(
        'docker network ls',
        process.cwd(),
        true
    );

    if (networkList.includes(config.docker.network.name)) {
        return;
    }

    await execCommandAsync(`docker network create --driver=bridge ${ config.docker.network.name }`);
};

const stop = async () => {

};

module.exports = {
    start,
    stop
};
