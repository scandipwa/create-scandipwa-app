/* eslint-disable consistent-return */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async-command');
const inquirer = require('inquirer');
const { execAsyncSpawn } = require('../util/exec-async-command');

const installBrew = async () => {
    logger.log('Checking HomeBrew...');
    const { result: homeBrewVersion } = await execAsyncSpawn('brew -v', { withCode: true });

    if (/Homebrew \d+\.\d+\.\d+/.test(homeBrewVersion)) {
        logger.log('Homebrew installed!');
        return true;
    }
    logger.warn(`Package ${logger.style.misc('homebrew')} is not installed`);

    const answer = await inquirer.prompt([
        {
            type: 'expand',
            message: 'Do you want to install Homebrew now?',
            name: 'install homebrew',
            choices: [
                {
                    key: 'y',
                    value: 'yes',
                    name: 'Yes'
                },
                {
                    key: 'n',
                    name: 'No',
                    value: 'no'
                }
            ]
        }
    ]);

    if (answer['install homebrew'] === 'yes') {
        logger.log('Installing Homebrew...');

        await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"');

        logger.log('Homebrew installed!');

        return true;
    }
    logger.error('Aborting installation');

    return false;
};

module.exports = installBrew;
