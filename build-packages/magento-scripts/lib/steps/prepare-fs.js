const path = require('path');
const {
    cachePath, templatePath, php, appPath
} = require('../config');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');
const checkConfigPath = require('../util/set-config');
const createApplicationConfig = require('./create-application-config');

const createCacheFolder = async () => createDirSafe(cachePath);

const checkCacheFolder = async () => pathExists(cachePath);

async function prepareFileSystem(ctx) {
    const appConfigOk = await createApplicationConfig();

    if (!appConfigOk) {
        throw new Error('app config is not found');
    }

    const portConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'port-config.json'),
        template: path.join(templatePath, 'port-config.template.json'),
        name: 'port config',
        ports: ctx.ports,
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
        ports: ctx.ports,
        overwrite: true,
        templateArgs: {
            mageRoot: appPath
        }
    });

    if (!nginxConfigOk) {
        throw new Error('nginx config not found');
    }

    const phpFpmConfigOk = await checkConfigPath({
        configPathname: php.phpFpmConfPath,
        template: path.join(templatePath, 'php-fpm.template.conf'),
        name: 'php-fpm',
        ports: ctx.ports,
        overwrite: true
    });

    if (!phpFpmConfigOk) {
        throw new Error('php-fpm config not found');
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

    // const magentoOk = await installMagento();

    // if (!magentoOk) {
    //     process.exit(1);
    // }
}

module.exports = { prepareFileSystem, createCacheFolder, checkCacheFolder };
