const fs = require('fs');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const config = require('../config');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');

const install = async () => {
    fs.mkdirSync(config.composer.dirPath);

    try {
        await execCommandAsync(
            `${ config.php.binPath } -r "copy('https://getcomposer.org/composer-1.phar', '${ config.composer.binPath }');"`
        );
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Unexpected issue, while installing composer.',
            'Please see the error log above.'
        );

        logger.note(
            'We would appreciate an issue on GitHub :)'
        );

        process.exit();
    }
};

module.exports = install;
