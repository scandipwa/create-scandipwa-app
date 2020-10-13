const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async');
const os = require('os');
const logSymbols = require('log-symbols');
const ora = require('ora');

const dockerInstallDarwinUrl = 'https://docs.docker.com/docker-for-mac/install/'
const dockerInstallLinuxUrl = 'https://docs.docker.com/engine/install/'

module.exports = async () => {
    const output = ora('Checking docker install...').start()
    const dockerVersionOutput = await execAsync('docker -v')
    if (/Docker version/.test(dockerVersionOutput)) {
        const dockerVersion = dockerVersionOutput.match(/Docker version ([\d.]+)/)[1]
        output.succeed(`Docker version ${dockerVersion} installed!`)
        return true
    }

    output.fail(`Docker is not installed. Please follow this instructions to install it: ${os.platform() === 'darwin' ? dockerInstallDarwinUrl : dockerInstallLinuxUrl }`)
    return false
}
