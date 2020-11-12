const path = require('path');
const getDockerConfig = require('./docker');
const applicationConfig = require('./application');
const getPhpConfig = require('./php');
const getComposerConfig = require('./composer');

// TODO: get application version from config
const applicationVersion = '2.4.1';

const config = {
    // TODO: get more unique prefix
    prefix: path.parse(process.cwd()).name,
    magentoDir: path.join(process.cwd(), 'src'),
    templateDir: path.join(__dirname, 'template'),
    cacheDir: path.join(process.cwd(), 'node_modules', '.create-scandipwa-app-cache')
};

const application = applicationConfig[applicationVersion];
const php = getPhpConfig(application, config);
const docker = getDockerConfig(application, config);
const composer = getComposerConfig(application, config);
const magento = { version: applicationVersion };

module.exports = {
    config,
    magento,
    php,
    composer,
    docker
};
