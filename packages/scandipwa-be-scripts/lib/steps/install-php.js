const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync, execAsyncWithCallback } = require('../util/exec-async');
const ora = require('ora');
const {
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    }
} = require('../config')

const checkPHPInGlobalCache = async () => {
    try {
        await execAsync(`ls ${phpBinPath}`)
        return true
    } catch (e) {
        return false
    }
}

const usePHPVersion = async ({ output }) => {
    try {
        const usedPHPVersion = await execAsync('php -v | grep ^PHP')
        if (!requiredPHPVersionRegex.test(usedPHPVersion)) {
            // Sometimes a bug happens and it returns an error
            await execAsync(`source ~/.phpbrew/bashrc && phpbrew use ${requiredPHPVersion}`);
        }
    } catch (e) {
        output.fail(e.message)

        logger.error(
            'Unexpected error while switching to required PHP.',
            'See ERROR log above.'
        );

        return false
    }

    output.succeed(`Using php version ${requiredPHPVersion}`)

    return true
}

const setupPHPExtensions = async ({ output }) => {
    try {
        const loadedPHPModules = await execAsync(`${phpBinPath} -m`)
        // console.log(loadedPHPModules)
        const missingPHPExtensions = phpExtensions.filter(ext => !loadedPHPModules.includes(ext))
        if (missingPHPExtensions.length > 0) {
            for (const extension of missingPHPExtensions) {
                output.start(`Installing PHP extension ${extension}`)
                await execAsync(`source ~/.phpbrew/bashrc && phpbrew use ${requiredPHPVersion} && phpbrew ext install ${extension}`)
                output.succeed(`PHP extension ${extension} installed!`)
            }
        }
    } catch (e) {
        output.fail(e.message)

        logger.error(
            'Unexpected error while setting up PHP extensions.',
            'See ERROR log above.'
        );
    }

    output.succeed('PHP extensions are installed!')
}

const buildPHP = async ({ output }) => {
    try {
        await execAsyncWithCallback('phpbrew -v')
    } catch (e) {
        if (/phpbrew: command not found/.test(e.message)) {
            output.fail(`Package ${ logger.style.misc('phpbrew') } is not installed!.\nTo install, follow this instructions: https://github.com/phpbrew/phpbrew/wiki/Quick-Start`)

            return false
        }
    }

    try {
        const PHPBrewVersions = await execAsyncWithCallback('phpbrew list')

        if (!requiredPHPVersionRegex.test(PHPBrewVersions)) {
            output.start(`Compiling and building PHP-${requiredPHPVersion}...`)
            await execAsyncWithCallback(
                `phpbrew install -j $(nproc) ${ requiredPHPVersion } \
                +bz2 +bcmath +ctype +curl +dom +filter +hash \
                +iconv +json +mbstring +openssl +xml +mysql \
                +pdo +soap +xmlrpc +xml +zip +fpm`,
                {
                    callback: line => {
                        if (line.includes('Building...')) {
                            output.text = `Building PHP-${requiredPHPVersion}...`
                        }
                        if (line.includes('Installing...')) {
                            output.text = `Installing PHP-v${requiredPHPVersion}...`
                        }
                    }
                }
            );
        }
        output.succeed('PHP compiled successfully!')
    } catch (e) {
        output.fail(e.message)()

        logger.error(e)
        logger.error(
            'Unexpected error while compiling and building PHP.',
            'See ERROR log above.'
        );
        return false
    }
    return true
}

const installPHP = async () => {
    const output = ora('Checking PHP...').start()

    const hasPHPInGlobalCache = await checkPHPInGlobalCache()

    if (!hasPHPInGlobalCache) {
        output.warn(`Required PHP version ${requiredPHPVersion} not found in cache, starting build...`)
        output.info('This operation can take some time')
        const buildPHPOk = await buildPHP({ output })
        if (!buildPHPOk) {
            return false
        }
    }
    await usePHPVersion({ output })
    await setupPHPExtensions({ output })

    output.stop()

    return true
};

module.exports = installPHP;
