const path = require('path');
const { cachePath, templatePath, php } = require('../config');
const ora = require('ora');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');
const installMagento = require('./install-magento');
const checkConfigPath = require('../util/check-config');

const checkCacheFolder = async () => pathExists(cachePath);

const createCacheFolder = async ({ output }) => {
    await createDirSafe(cachePath);
    output.succeed('Cache folder created!');
};

async function prepareFileSystem(ports) {
    const output = ora('Checking filesystem...').start();
    // Make sure cache folder is present
    const cacheFolderOk = await checkCacheFolder();

    if (!cacheFolderOk) {
        await createCacheFolder({ output });
    } else {
        output.succeed('Cache folder already created');
    }

    const nginxConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'nginx', 'conf.d', 'default.conf'),
        dirName: path.join(cachePath, 'nginx', 'conf.d'),
        template: path.join(templatePath, 'nginx.template.conf.d'),
        name: 'Nginx',
        output,
        ports
    });

    if (!nginxConfigOk) {
        process.exit(1);
    }

    const phpFpmConfigOk = await checkConfigPath({
        configPathname: php.phpFpmConfPath,
        template: path.join(templatePath, 'php-fpm.template.conf'),
        name: 'php-fpm',
        output,
        ports
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
