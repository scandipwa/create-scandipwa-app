const { execAsync } = require('../util/exec-async-command');
const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const dockerInstallDarwinUrl = 'https://docs.docker.com/docker-for-mac/install/';
const dockerInstallLinuxUrl = 'https://docs.docker.com/engine/install/';

module.exports = async () => {
    logger.log('Checking docker install...');
    const dockerVersionOutput = await execAsync('docker -v');
    if (/Docker version/.test(dockerVersionOutput)) {
        const dockerVersion = dockerVersionOutput.match(/Docker version ([\d.]+)/)[1];
        logger.log(`Using docker version ${dockerVersion}`);
        return true;
    }

    // eslint-disable-next-line max-len
    logger.error(`Docker is not installed. Please follow this instructions to install it: ${os.platform() === 'darwin' ? dockerInstallDarwinUrl : dockerInstallLinuxUrl }`);
    return false;
};
