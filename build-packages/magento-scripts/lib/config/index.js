const path = require('path');
const getDockerConfig = require('./docker');
const { magentoVersionConfigs, allVersions } = require('./version-config');
const getPhpConfig = require('./php');
const getComposerConfig = require('./composer');
const getApplicationConfig = require('./application');

const platforms = ['linux'];

// TODO: ask for this version?
const magentoVersion = '2.4.1';

const config = {
    // TODO: get more unique prefix
    prefix: path.parse(process.cwd()).name,
    magentoDir: process.cwd(),
    templateDir: path.join(__dirname, 'templates'),
    cacheDir: path.join(process.cwd(), 'node_modules', '.create-scandipwa-app-cache')
};

const versionConfig = magentoVersionConfigs[magentoVersion];
const php = getPhpConfig(versionConfig, config);
const docker = getDockerConfig(versionConfig, config);
const composer = getComposerConfig(versionConfig, config);
const app = getApplicationConfig(versionConfig, config);

const magento = {
    version: magentoVersion,
    binPath: path.join(config.magentoDir, 'bin', 'magento')
};

module.exports = {
    getConfigFromMagentoVersion(magentoVersion) {
        if (!allVersions.includes(magentoVersion)) {
            throw new Error(`No config found for magento version ${magentoVersion}`);
        }

        return {
            php: getPhpConfig(magentoVersionConfigs[magentoVersion], config),
            docker: getDockerConfig(magentoVersionConfigs[magentoVersion], config),
            composer: getComposerConfig(magentoVersionConfigs[magentoVersion], config),
            app: getApplicationConfig(magentoVersionConfigs[magentoVersion], config),
            config
        };
    },
    app,
    config,
    magento,
    php,
    composer,
    docker,
    platforms
};
