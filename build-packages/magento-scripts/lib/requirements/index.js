const checkPlatform = require('./platform');
const checkPhpbrew = require('./phpbrew');
const checkComposer = require('./composer');
const checkDocker = require('./docker');

const checkRequirements = {
    title: 'Checking requirements',
    task: (ctx, task) => task.newListr([
        // TODO add support for mac
        // checking if user is on supported platform
        checkPlatform,
        // check the PHPBrew installation
        checkPhpbrew,
        // check the Docker installation
        checkDocker,
        // check for COMPOSER_AUTH
        checkComposer
    ])
};

module.exports = { checkRequirements };
