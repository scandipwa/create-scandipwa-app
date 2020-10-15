const fs = require('fs')
const path = require('path')
const eta = require('eta')
const { cachePath } = require('../config')
const ora = require('ora')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')

const createDirSafe = async (dir) => {
    try {
        await fs.promises.mkdir(dir)
    } catch {}
}

const checkCacheFolder = async () => {
    try {
        await fs.promises.access(cachePath, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

const createCacheFolder = async ({ output }) => {
    try {
        await fs.promises.mkdir(cachePath)
        output.succeed('Cache folder created!')
        return true
    } catch (e) {
        output.fail('create cache folder error');

        logger.log(e)

        logger.error('Failed to create cache folder. See ERROR log above');
        return false
    }
}

const checkNginxConfig = async () => {
    try {
        await fs.promises.access(path.join(cachePath, 'nginx', 'magento.conf'), fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

const createNginxConfig = async ({ output, ports }) => {
    const nginxTemplate = await fs.promises.readFile(path.join(process.cwd(), 'lib', 'templates', 'magento-nginx-config.template'), 'utf-8')

    const nginxConfig = await eta.render(nginxTemplate, { port: ports.fpm })

    try {
        await createDirSafe(path.join(cachePath, 'nginx'))
        await fs.promises.writeFile(path.join(cachePath, 'nginx', 'magento.conf'), nginxConfig, { encoding: 'utf-8'})
        output.succeed('Nginx config created!')
        return true
    } catch (e) {
        output.fail('create nginx config error');

        logger.log(e)

        logger.error('Failed to create nginx configuration file. See ERROR log above');
        return false
    }
}

const checkVarnishConfig = async () => {
    try {
        await fs.promises.access(path.join(cachePath, 'varnish', 'default.vcl'), fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

const createVarnishConfig = async ({ output, ports }) => {
    const varnishTemplate = await fs.promises.readFile(path.join(process.cwd(), 'lib', 'templates', 'varnish-config.template'), 'utf-8')

    const varnishConfig = await eta.render(varnishTemplate, { port: ports.fpm })

    try {
        await createDirSafe(path.join(cachePath, 'varnish'))
        await fs.promises.writeFile(path.join(cachePath, 'varnish', 'default.vcl'), varnishConfig, { encoding: 'utf-8' })
        output.succeed('Varnish config created!')
        return true
    } catch (e) {
        output.fail('create varnish config error');

        logger.log(e)

        logger.error('Failed to create varnish configuration file. See ERROR log above');
        return false
    }
}

async function prepareFileSystem(ports) {
    const output = ora('Checking filesystem...').start()
    // Make sure cache folder is present
    const cacheFolderOk = await checkCacheFolder()

    if (!cacheFolderOk) {
        const createCacheFolderOk = await createCacheFolder({ output })

        if (!createCacheFolderOk) {
            process.exit(1)
        } else {
            output.succeed('Cache folder created!')
        }
    } else {
        output.succeed('Cache folder already created.')
    }

    const nginxConfigOk = await checkNginxConfig()

    if (!nginxConfigOk) {
        output.warn('Nginx config not found, creating...')

        const createNginxConfigOk = await createNginxConfig({ output, ports })

        if (!createNginxConfigOk) {
            process.exit(1)
        }
    }

    const varnishConfigOk = await checkVarnishConfig()

    if (!varnishConfigOk) {
        output.warn('Varnish config not found, creating...')

        const createVarnishConfigOk = await createVarnishConfig({ output, ports })

        if (!createVarnishConfigOk) {
            process.exit(1)
        }
    }

    // Copy template files
}

module.exports = prepareFileSystem;
