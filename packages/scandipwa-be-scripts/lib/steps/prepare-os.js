const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const os = require('os');
const inquirer = require('inquirer');
const installDeps = require('./install-deps');
const getMissingPackages = require('../util/get-missing-packages');
const installDocker = require('./install-docker');
const packageExists = require('../util/package-exists');
const ora = require('ora');
const logSymbols = require('log-symbols');
const installPHP = require('./install-php');

// const commonPackages = [
//     'php',
//     'composer',
//     'docker'
// ];

// const macPackages = [
//     'autoconf',
//     'pkg-config'
// ];

// const linuxPackages = [
//     'build-essential',
//     'libbz2-dev',
//     'libreadline-dev',
//     'libsqlite3-dev',
//     'libssl-dev',
//     'libxml2-dev',
//     'pkg-config'
// ];

const linuxValidator = async ({ output }) => {
    const missingPackages = await getMissingPackages(linuxPackages)

    // TODO: add installation instructions
    if (missingPackages.length > 0) {
        const isPlural = missingPackages.length > 1
        output.fail(`Package${isPlural ? 's' : ''} ${logger.style.misc(missingPackages.join(', '))} ${isPlural ? 'are' : 'is'} not installed.`)
        const answer = await inquirer.prompt([
            {
                type: 'expand',
                message: 'Do you want to install them?',
                name: 'install dependencies',
                choices: [
                    {
                        key: 'y',
                        name: 'Yes',
                        value: 'yes'
                    },
                    {
                        key: 'n',
                        name: 'No',
                        value: 'no'
                    }
                ]
            }
        ])

        if (answer['install dependencies'] === 'yes') {
            await installDeps.linux.installDeps({ output })
            return true
        }

        output.fail('Aborting installation')
        return false;
    }

    return true
};

const darwinValidator = async ({ output }) => {
    try {
        await packageExists('brew');
    } catch (e) {
        output.stop()
        logger.error('Brew is not installed')
        const answer = await inquirer.prompt([
            {
                type: 'expand',
                message: 'Do you want to install it?',
                name: 'install home-brew',
                choices: [
                    {
                        key: 'y',
                        name: 'Yes',
                        value: 'yes'
                    },
                    {
                        key: 'n',
                        name: 'No',
                        value: 'no'
                    }
                ]
            }
        ])

        if (answer['install home-brew'] === 'yes') {
            await darwin.installBrew()
        } else {
            // TODO: add installation instructions
            logger.error('Aborting installation')
            return false
        }
    }

    const missingPackages = await getMissingPackages(macPackages)

    // TODO: add installation instructions
    if (missingPackages.length > 0) {
        const isPlural = missingPackages.length > 1
        logger.fail(`Package${isPlural ? 's' : ''} ${logger.style.misc(missingPackages.join(', '))} ${isPlural ? 'are' : 'is'} not installed.`)

        const answer = await inquirer.prompt([
            {
                type: 'expand',
                message: 'Do you want to install them?',
                name: 'install dependencies',
                choices: [
                    {
                        key: 'y',
                        name: 'Yes',
                        value: 'yes'
                    },
                    {
                        key: 'n',
                        name: 'No',
                        value: 'no'
                    }
                ]
            }
        ])

        if (answer['install dependencies'] === 'yes') {
            await darwin.installDeps()
            return true
        } else {
            logger.log(logSymbols.error, 'Aborting installation')
        }

        return false;
    }

    return true
};

const supportedPlatforms = ['darwin', 'linux']

const validateOS = async () => {
    if (!supportedPlatforms.includes(os.platform())) {
        logger.error('Sorry, we don\'t currently support your OS.');
        process.exit();
    }

    if (os.platform() === 'darwin') {
        const minimumVersion = '10.5';
        if (!semver.gt(os.release(), minimumVersion)) {
            // check if the version is above 10.5
            logger.error(
                'Please update your system!',
                `MacOS bellow version ${ logger.style.misc(minimumVersion) } is not supported.`
            );

            return false;
        }

        const homeBrewOk = await installDeps.darwin.installBrew()
        if (!homeBrewOk) {
            process.exit(1)
        }
    }
    // await commonDeps.installPHP();
    // await commonDeps.installComposer();

    const dockerOk = await installDocker();

    if (!dockerOk) {
        process.exit(1)
    }

    const phpOk = await installPHP()

    if (!phpOk) {
        process.exit(1)
    }

};

module.exports = validateOS;
