const { execAsync } = require('../util/exec-async');

const getRunningContainers = async () => {
    const containerList = await execAsync('docker container ls -q')

    return containerList.split('\n').filter(Boolean)
}

module.exports = getRunningContainers
