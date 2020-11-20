const fs = require('fs');
const config = require('../config');
const phpFpmConfig = require('./php-fpm');
const nginxConfig = require('./nginx');
const magentoFolder = require('./magento');

module.exports = async (ports) => {
    if (!fs.existsSync(config.config.cacheDir)) {
        // create cache directory if it does not exist
        fs.mkdirSync(config.config.cacheDir, { recursive: true });
    }

    // TODO: we create it in the "getPorts" step
    // await createConfigurationFile({
    //     pathname: path.join(config.config.cacheDir, 'port-config.json'),
    //     template: path.join(config.config.templateDir, 'port-config.template.json'),
    //     templateArgs: { ports },
    //     isOverwrite: true
    // });

    // create nginx config
    nginxConfig(ports);

    // create PHP-FPM config
    phpFpmConfig(ports);

    // create Magento 2 application file-structure
    // TODO: ideally, we create it in the same folder
    magentoFolder();
};
