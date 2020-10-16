const fs = require('fs');
const path = require('path');
const eta = require('eta');
const { cachePath, templatePath } = require('../config');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createDirSafe = require('../util/create-dir-safe');
const pathExists = require('../util/path-exists');

const checkCacheFolder = async () => pathExists(cachePath);

const createCacheFolder = async ({ output }) => {
    await createDirSafe(cachePath);
    output.succeed('Cache folder created!');
};

const checkMagentoConfig = async () => pathExists(path.join(process.cwd(), 'app', 'etc', 'env.php'));

const createMagentoConfig = async ({ output, ports }) => {
    await createDirSafe(path.join(process.cwd(), 'app', 'etc'));
    const magentoEnvTemplate = await fs.promises.readFile(path.join(templatePath, 'magento-env.template.php'), 'utf-8');

    const magentoEnvConfig = await eta.render(magentoEnvTemplate, { ports, date: new Date().toUTCString() });

    try {
        await fs.promises.writeFile(path.join(process.cwd(), 'app', 'etc', 'env.php'), magentoEnvConfig, { encoding: 'utf-8' });
        output.succeed('Magento config created!');
        return true;
    } catch (e) {
        output.fail('create magento config error');

        logger.log(e);

        logger.error('Failed to create magento configuration file. See ERROR log above');
        return false;
    }
};

const checkNginxConfig = async () => pathExists(path.join(cachePath, 'nginx', 'conf.d', 'default.conf'));

const createNginxConfig = async ({ output, ports }) => {
    const nginxTemplate = await fs.promises.readFile(path.join(templatePath, 'nginx.template.conf.d'), 'utf-8');

    const nginxConfig = await eta.render(nginxTemplate, { port: ports.fpm });

    try {
        await createDirSafe(path.join(cachePath, 'nginx', 'conf.d'));
        await fs.promises.writeFile(path.join(cachePath, 'nginx', 'conf.d', 'default.conf'), nginxConfig, { encoding: 'utf-8' });
        output.succeed('Nginx config created!');
        return true;
    } catch (e) {
        output.fail('create nginx config error');

        logger.log(e);

        logger.error('Failed to create nginx configuration file. See ERROR log above');
        return false;
    }
};

// const checkVarnishConfig = async () => {
//     try {
//         await fs.promises.access(path.join(cachePath, 'varnish', 'default.vcl'), fs.constants.F_OK);
//         return true;
//     } catch {
//         return false;
//     }
// };

// const createVarnishConfig = async ({ output, ports }) => {
//     const varnishTemplate = await fs.promises.readFile(path.join(process.cwd(), 'lib', 'templates', 'varnish-config.template'), 'utf-8');

//     const varnishConfig = await eta.render(varnishTemplate, { port: ports.fpm, nginxServiceName: docker.container.nginx().name });

//     try {
//         await createDirSafe(path.join(cachePath, 'varnish'));
//         await fs.promises.writeFile(path.join(cachePath, 'varnish', 'default.vcl'), varnishConfig, { encoding: 'utf-8' });
//         output.succeed('Varnish config created!');
//         return true;
//     } catch (e) {
//         output.fail('create varnish config error');

//         logger.log(e);

//         logger.error('Failed to create varnish configuration file. See ERROR log above');
//         return false;
//     }
// };

async function prepareFileSystem(ports) {
    const output = ora('Checking filesystem...').start();
    // Make sure cache folder is present
    const cacheFolderOk = await checkCacheFolder();

    if (!cacheFolderOk) {
        await createCacheFolder({ output });
    } else {
        output.succeed('Cache folder already created.');
    }

    const nginxConfigOk = await checkNginxConfig();

    if (!nginxConfigOk) {
        output.warn('Nginx config not found, creating...');

        const createNginxConfigOk = await createNginxConfig({ output, ports });

        if (!createNginxConfigOk) {
            process.exit(1);
        }
    }

    const magentoConfigOk = await checkMagentoConfig();

    if (!magentoConfigOk) {
        output.warn('App folder not found, creating...');

        const createAppFolderOk = await createMagentoConfig({ output, ports });

        if (!createAppFolderOk) {
            process.exit(1);
        }
    }

    // const varnishConfigOk = await checkVarnishConfig()

    // if (!varnishConfigOk) {
    //     output.warn('Varnish config not found, creating...')

    //     const createVarnishConfigOk = await createVarnishConfig({ output, ports })

    //     if (!createVarnishConfigOk) {
    //         process.exit(1)
    //     }
    // }

    // Copy template files
}

module.exports = prepareFileSystem;
