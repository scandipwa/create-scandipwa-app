const packageExists = require('../util/package-exists');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const os = require('os');

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
    try {
        await Promise.all(linuxPackages.map(packageExists));
        return true;
    } catch (packageName) {
        logger.error(
            // TODO: add installation instructions
            `Package ${ logger.style.misc(packageName) } is not installed!`
        );

        return false;
    }
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
        logger.error(
            // TODO: add installation instructions
            'Package brew is not installed!'
        );

        return false;
    }

    try {
        await Promise.all(macPackages.map(packageExists));
        return true;
    } catch (packageName) {
        logger.error(
            // TODO: add installation instructions
            `Package ${ logger.style.misc(packageName) } is not installed!`
        );

        return false;
    }
};

const platformValidatorMap = {
    linux: linuxValidator,
    darwin: darwinValidator
};

const validateOS = async () => {
    logger.logN('Checking packages');
    const platform = (os.platform());

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
