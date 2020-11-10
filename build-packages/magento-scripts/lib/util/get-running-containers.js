const { docker } = require('../config');
const { execAsync } = require('./exec-async-command');

const getRunningContainers = async () => {
    const containerList = (await execAsync('docker container ls')).split('\n').filter(Boolean);

    return docker.containerList.filter((c) => containerList.some((line) => line.includes(c().name)));
};

module.exports = getRunningContainers;
