const path = require('path');
const {
    cachePath, templatePath, php, appPath
} = require('../config');
const ora = require('ora');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');
const installMagento = require('./install-magento');
const checkConfigPath = require('../util/check-config');

const checkCacheFolder = async () => pathExists(cachePath);

const createCacheFolder = async () => {
    await createDirSafe(cachePath);
};

async function prepareFileSystem(ports) {
    const output = ora('Checking filesystem...').start();
    // Make sure cache folder is present
    const cacheFolderOk = await checkCacheFolder();

    if (!cacheFolderOk) {
        await createCacheFolder();
        output.succeed('Cache folder created!');
    } else {
        output.succeed('Cache folder already created');
    }

    const portConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'port-config.json'),
        template: path.join(templatePath, 'port-config.template.json'),
        name: 'port config',
        output,
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
        output,
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
        output,
        ports,
        overwrite: true
    });

    if (!phpFpmConfigOk) {
        process.exit(1);
    }

    const magentoOk = await installMagento();

    if (!magentoOk) {
        process.exit(1);
    }
}

module.exports = prepareFileSystem;
