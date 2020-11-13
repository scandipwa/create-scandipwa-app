const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const checkPlatform = require('./platform');
const checkCommand = require('./command');
const checkComposer = require('./composer');

const requirements = async () => {
    // checking if user is on supported platform
    checkPlatform(['linux'], () => {
        logger.note('The support for other OS is coming soon!');
    });

    // check the PHPBrew installation
    checkCommand('phpbrew', () => {
        logger.note(
            'To install PHPBrew, you must first make sure the requirements are met.',
            `The requirements are available here: ${ logger.style.link('https://github.com/phpbrew/phpbrew/wiki/Requirement') }.`,
            `Then, you can follow the installation instruction, here: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#installation') }.`,
            'When completed, try running this script again.'
        );
    });

    // check the Docker installation
    checkCommand('docker', () => {
        logger.note(
            `To install Docker, follow the official instruction: ${ logger.style.link('https://docs.docker.com/engine/install/') }.`,
            'Once there, select your distribution and follow the instructions on the page.',
            'When completed, try running this script again.'
        );
    });

    // check for COMPOSER_AUTH
    checkComposer();
};

module.exports = requirements;
