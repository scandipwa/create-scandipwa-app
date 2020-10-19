const fs = require('fs');
const path = require('path');
const eta = require('eta');
const { cachePath, templatePath } = require('../config');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');
const installMagento = require('./install-magento');

const checkCacheFolder = async () => pathExists(cachePath);

const createCacheFolder = async ({ output }) => {
    await createDirSafe(cachePath);
    output.succeed('Cache folder created!');
};

const checkConfigPath = async ({
    configPathname, dirName, template, ports, name, output
}) => {
    const pathOk = await pathExists(configPathname);

    if (pathOk) {
        output.succeed(`${name} config already created`);
        return true;
    }
    output.warn(`${name} config not found, creating...`);
    const configTemplate = await fs.promises.readFile(template, 'utf-8');

    const compliedConfig = await eta.render(configTemplate, { ports, date: new Date().toUTCString() });

    try {
        await createDirSafe(dirName);
        await fs.promises.writeFile(configPathname, compliedConfig, { encoding: 'utf-8' });
        output.succeed(`${name} config created`);
        return true;
    } catch (e) {
        output.fail(`create ${name} config error`);

        logger.log(e);

        logger.error(`Failed to create ${name} configuration file. See ERROR log above`);
        return false;
    }
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

    const magentoOk = await installMagento();

    if (!magentoOk) {
        process.exit(1);
    }

    // const magentoConfigOk = await checkConfigPath({
    //     configPathname: path.join(process.cwd(), 'src', 'app', 'etc', 'env.php'),
    //     dirName: path.join(process.cwd(), 'src', 'app', 'etc'),
    //     template: path.join(templatePath, 'magento-env.template.php'),
    //     name: 'App',
    //     output,
    //     ports
    // });

    // if (!magentoConfigOk) {
    //     process.exit(1);
    // }

    const phpConfigOk = await checkConfigPath({
        configPathname: path.join(cachePath, 'php', 'php.ini'),
        dirName: path.join(cachePath, 'php'),
        template: path.join(templatePath, 'php.template.ini'),
        name: 'PHP',
        output,
        ports
    });

    if (!phpConfigOk) {
        process.exit(1);
    }
}

module.exports = prepareFileSystem;
