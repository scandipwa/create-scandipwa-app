const path = require('path');
const getDockerConfig = require('./docker');
const versionConfigs = require('./version-config');
const getPhpConfig = require('./php');
const getComposerConfig = require('./composer');
const getApplicationConfig = require('./application');

const platforms = ['linux'];

// TODO: ask for this version?
const magentoVersion = '2.4.1';

const config = {
    // TODO: get more unique prefix
    prefix: path.parse(process.cwd()).name,
    magentoDir: path.join(process.cwd(), 'src'),
    templateDir: path.join(__dirname, 'templates'),
    cacheDir: path.join(process.cwd(), 'node_modules', '.create-scandipwa-app-cache')
};

const versionConfig = versionConfigs[magentoVersion];
const php = getPhpConfig(versionConfig, config);
const docker = getDockerConfig(versionConfig, config);
const composer = getComposerConfig(versionConfig, config);
const app = getApplicationConfig(versionConfig, config);

const magento = {
    version: magentoVersion,
    binPath: path.join(config.magentoDir, 'bin', 'magento')
};

module.exports = {
    app,
    config,
    magento,
    php,
    composer,
    docker,
    platforms
};
