const fs = require('fs');
const config = require('../config');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');

module.exports = async () => {
    if (!fs.existsSync(config.config.magentoDir)) {
        // create cache directory if it does not exist
        fs.mkdirSync(config.config.magentoDir, { recursive: true });
    }

    await execCommandAsync(
        `${ config.php.binPath } ${ config.composer.binPath } create-project \
        --repository=https://repo.magento.com/ \
        magento/project-community-edition=${ config.magento.version } \
        src`
    );
};
