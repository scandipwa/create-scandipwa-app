const { execAsync } = require('../util/exec-async-command');
const os = require('os');

const dockerInstallDarwinUrl = 'https://docs.docker.com/docker-for-mac/install/';
const dockerInstallLinuxUrl = 'https://docs.docker.com/engine/install/';

module.exports = async () => {
    output.start('Checking docker install...');
    const dockerVersionOutput = await execAsync('docker -v');
    if (/Docker version/.test(dockerVersionOutput)) {
        const dockerVersion = dockerVersionOutput.match(/Docker version ([\d.]+)/)[1];
        output.succeed(`Using docker version ${dockerVersion}`);
        return true;
    }

    // eslint-disable-next-line max-len
    output.fail(`Docker is not installed. Please follow this instructions to install it: ${os.platform() === 'darwin' ? dockerInstallDarwinUrl : dockerInstallLinuxUrl }`);
    return false;
};
