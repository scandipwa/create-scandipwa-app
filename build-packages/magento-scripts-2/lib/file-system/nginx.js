const path = require('path');
const config = require('../config');
const createConfigurationFile = require('../util/create-config-file');

module.exports = async (ports) => {
    await createConfigurationFile({
        pathname: path.join(config.config.cacheDir, 'nginx', 'conf.d', 'default.conf'),
        template: path.join(config.config.templateDir, 'nginx.template.conf'),
        templateArgs: { mageRoot: config.config.magentoDir, ports },
        isOverwrite: true
    });
};
