/* eslint-disable consistent-return */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async');
const inquirer = require('inquirer');
const ora = require('ora');

const installBrew = async () => {
    const output = ora('Checking HomeBrew...').start();
    const homeBrewVersion = await execAsync('brew -v');

    if (/Homebrew \d+\.\d+\.\d+/.test(homeBrewVersion)) {
        output.succeed('Homebrew installed!');
        return;
    }
    output.fail(`Package ${logger.style.misc('homebrew')} is not installed`);

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
        output.start('Installing Homebrew...');

        await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"');

        output.succeed('Homebrew installed!');

        return true;
    }
    output.fail('Aborting installation');

    return false;
};

module.exports = installBrew;
