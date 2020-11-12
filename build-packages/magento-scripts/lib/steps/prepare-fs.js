const path = require('path');
const {
    cachePath, templatePath, php, appPath
} = require('../config');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');
const installMagento = require('./install-magento');
const checkConfigPath = require('../util/check-config');
const createApplicationConfig = require('./create-application-config');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const createCacheFolder = async () => createDirSafe(cachePath);

const checkCacheFolder = async () => pathExists(cachePath);

async function prepareFileSystem(ports) {
    logger.log('Checking filesystem...');
    // Make sure cache folder is present
    const cacheFolderOk = await checkCacheFolder();

    if (!cacheFolderOk) {
        await createCacheFolder();
        logger.log('Cache folder created!');
    } else {
        logger.log('Cache folder already created');
    }

    const appConfigOk = await createApplicationConfig();

    if (!appConfigOk) {
        process.exit(1);
    }

    const portConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'port-config.json'),
        template: path.join(templatePath, 'port-config.template.json'),
        name: 'port config',
        ports,
        overwrite: true
    });

    if (!portConfigOk) {
        process.exit(1);
    }

    const nginxConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'nginx', 'conf.d', 'default.conf'),
        dirName: path.join(cachePath, 'nginx', 'conf.d'),
        template: path.join(templatePath, 'nginx.template.conf'),
        name: 'Nginx',
        ports,
        overwrite: true,
        templateArgs: {
            mageRoot: appPath
        }
    });

    if (!nginxConfigOk) {
        process.exit(1);
    }

    const phpFpmConfigOk = await checkConfigPath({
        configPathname: php.phpFpmConfPath,
        template: path.join(templatePath, 'php-fpm.template.conf'),
        name: 'php-fpm',
        ports,
        overwrite: true
    });

    if (!phpFpmConfigOk) {
        process.exit(1);
    }

    // const composerConfigOk = await checkConfigPath({
    //     dirName: appPath,
    //     configPathname: path.join(appPath, 'composer.json'),
    //     template: path.join(templatePath, 'composer.template.json'),
    //     name: 'composer',
    //     output,
    //     ports
    // });

    // if (!composerConfigOk) {
    //     process.exit(1);
    // }

    const magentoOk = await installMagento();

    if (!magentoOk) {
        process.exit(1);
    }
}

module.exports = prepareFileSystem;
