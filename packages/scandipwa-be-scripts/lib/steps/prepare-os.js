const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const os = require('os');
const installDeps = require('./install-deps');
const installDocker = require('./install-docker');
const installPHP = require('./install-php');

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

    const phpOk = await installPHP()

    if (!phpOk) {
        process.exit(1)
    }

    const dockerOk = await installDocker();

    if (!dockerOk) {
        process.exit(1)
    }

};

module.exports = validateOS;
