const { execAsyncSpawn } = require('../util/exec-async-command');
const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const dockerInstallDarwinUrl = 'https://docs.docker.com/docker-for-mac/install/';
const dockerInstallLinuxUrl = 'https://docs.docker.com/engine/install/';

const getDockerVersion = async () => {
    const { result, code } = await execAsyncSpawn('docker -v', { withCode: true });
    if (code === 0) {
        const dockerVersion = result.match(/Docker version ([\d.]+)/)[1];

        return dockerVersion;
    }

    return null;
};

const checkDocker = async () => {
    try {
        const { code } = await execAsyncSpawn('docker -v', { withCode: true });
        if (code === 0) {
            const dockerVersion = await getDockerVersion();
            logger.log(`Using docker version ${dockerVersion}`);
            return true;
        }

        return false;
    } catch (e) {
        return false;
    }
};

const installDocker = async () => {
    logger.log('Checking docker install...');
    const dockerOk = await checkDocker();
    if (dockerOk) {
        return true;
    }

    // eslint-disable-next-line max-len
    logger.error(`Docker is not installed. Please follow this instructions to install it: ${os.platform() === 'darwin' ? dockerInstallDarwinUrl : dockerInstallLinuxUrl }`);
    return false;
};

module.exports = { installDocker, checkDocker, getDockerVersion };
