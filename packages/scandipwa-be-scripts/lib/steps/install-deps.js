const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async');
const getAnswer = require('../util/get-user-answer');

const linuxDependenciesInstaller = async () => {

}

const darwinBrewInstaller = async () => {
    await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"')
}

module.exports = {
    linux: {
        installDeps: linuxDependenciesInstaller
    },
    darwin: {
        installBrew: darwinBrewInstaller
    }
}
