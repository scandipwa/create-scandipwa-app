const path = require('path');
const config = require('../config');
const createConfigurationFile = require('../util/create-config-file');

module.exports = async (ports) => {
    await createConfigurationFile({
        pathname: config.php.fpmConfPath,
        template: path.join(config.config.templateDir, 'php-fpm.template.conf'),
        templateArgs: { ports },
        isOverwrite: true
    });
};
