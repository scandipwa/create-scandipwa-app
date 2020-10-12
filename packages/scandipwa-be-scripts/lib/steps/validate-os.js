const packageExists = require('../util/package-exists');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const os = require('os');
const getAnswer = require('../util/get-user-answer');
const { darwin } = require('./install-deps');
const getMissingPackages = require('../util/get-missing-packages');

const commonPackages = [
    'php',
    'composer',
    'docker'
];

const macPackages = [
    ...commonPackages,
    'autoconf',
    'pkg-config'
];

const linuxPackages = [
    ...commonPackages,
    'build-essential',
    'libbz2-dev',
    'libreadline-dev',
    'libsqlite3-dev',
    'libssl-dev',
    'libxml2-dev',
    'pkg-config'
];

const linuxValidator = async () => {
    const missingPackages = await getMissingPackages(linuxPackages)

    // TODO: add installation instructions
    if (missingPackages.length > 0) {
        if (missingPackages.length === 1) {
            logger.error(`Package ${ logger.style.misc(missingPackages[0]) } is not installed!`)
        } else {
            logger.error(`Packages ${ logger.style.misc(missingPackages.join(', ')) } are not installed!`);
        }

        return false;
    }

    return true
};

const darwinValidator = async () => {
    const minimumVersion = '10.5';

    if (!semver.gt(os.release(), minimumVersion)) {
        // check if the version is above 10.5
        logger.error(
            'Please update your system!',
            `MacOS bellow version ${ logger.style.misc(minimumVersion) } is not supported.`
        );

        return false;
    }

    try {
        await packageExists('brew');
    } catch (e) {
        const installBrew = await getAnswer('Brew is not installed, do you want to install it?', 'yes')
        if (installBrew === 'yes') {
            await darwin.installBrew()
        } else {
            logger.error(
                // TODO: add installation instructions
                'Package brew is not installed!'
            );

            return false;
        }
    }

    const missingPackages = await getMissingPackages(macPackages)

    // TODO: add installation instructions
    if (missingPackages.length > 0) {
        if (missingPackages.length === 1) {
            logger.error(`Package ${ logger.style.misc(missingPackages[0]) } is not installed!`)
        } else {
            logger.error(`Packages ${ logger.style.misc(missingPackages.join(', ')) } are not installed!`);
        }

        return false;
    }

    return true
};

const platformValidatorMap = {
    linux: linuxValidator,
    darwin: darwinValidator
};

const validateOS = async () => {
    logger.logN('Checking packages');
    const platform = os.platform();

    const validator = platformValidatorMap[platform];

    if (!validator) {
        logger.error('Sorry, we don\'t currently support your OS.');
        process.exit();
    }

    const isValid = await validator();

    if (!isValid) {
        process.exit();
    }
};

module.exports = validateOS;
