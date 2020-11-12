const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const os = require('os');
const macosVersion = require('macos-version');
const { installBrew } = require('./install-brew');
const installDocker = require('./install-docker');
const installPHP = require('./install-php');
const installComposer = require('./install-composer');

const supportedPlatforms = ['darwin', 'linux'];

// TODO add check for freetype2 and lib32-freetype2 packages in system.

const validateOS = async () => {
    if (!supportedPlatforms.includes(os.platform())) {
        logger.error('Sorry, we don\'t currently support your OS.');
        process.exit();
    }

    if (macosVersion.isMacOS) {
        const minimumVersion = '10.5';
        if (macosVersion.assertGreaterThanOrEqualTo(minimumVersion)) {
            // check if the version is above 10.5
            logger.error(
                'Please update your system!',
                `MacOS bellow version ${ logger.style.misc(minimumVersion) } is not supported.`
            );

            return false;
        }

        const homeBrewOk = await installBrew();
        if (!homeBrewOk) {
            process.exit(1);
        }
    }

    const phpOk = await installPHP();

    if (!phpOk) {
        process.exit(1);
    }

    const phpComposerOk = await installComposer();

    if (!phpComposerOk) {
        process.exit(1);
    }

    const dockerOk = await installDocker();

    if (!dockerOk) {
        process.exit(1);
    }

    return true;
};

module.exports = validateOS;
