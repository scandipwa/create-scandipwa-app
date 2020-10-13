const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync, execAsyncWithCallback } = require('../util/exec-async');
const ora = require('ora');

const installPHP = async () => {
    const output = ora('Checking PHP...')
    try {
        const phpBrewVersionOutput = await execAsync('phpbrew -v')

        const phpBrewVersion = phpBrewVersionOutput.match(/phpbrew ([\d.]+)/i)[1]
        output.succeed(`phpbrew version ${phpBrewVersion} installed!`)
    } catch (e) {
        if (/phpbrew: command not found/.test(e.message)) {
            output.fail(`Package ${ logger.style.misc('phpbrew') } is not installed!.\nTo install, follow this instructions: https://github.com/phpbrew/phpbrew/wiki/Quick-Start`)

            return false
        }
    }

    const requiredPHPVersion = '7.3.22';

    const requiredPHPVersionRegex = new RegExp(requiredPHPVersion)

    try {
        const PHPBrewVersions = await execAsync('phpbrew list')

        if (PHPBrewVersions.includes('Please install at least one PHP with your preferred version.')) {
            output.info('No PHP installed.')
        }


        if (!requiredPHPVersionRegex.test(PHPBrewVersions)) {
            output.start(`Compiling and building PHP ${requiredPHPVersion}. This operation can take some time...`)

            try {
                await execAsync('mkdir ~/.phpbrew')
            } catch {}

            try {
                await execAsync(
                    `phpbrew install -j $(nproc) ${ requiredPHPVersion } \
                    +bz2 +bcmath +ctype +curl +dom +filter +hash \
                    +iconv +json +mbstring +openssl +xml +mysql \
                    +pdo +soap +xmlrpc +xml +zip +fpm`
                );
            } catch (e) {
                output.fail(e.message)

                logger.error(
                    'Unexpected error while installing the PHP.',
                    'See ERROR log above.'
                );

                return false
            }
            output.succeed('PHP compiled successfully!')
        }
    } catch (e) {
        output.fail(e.message)

        logger.error(
            'Unexpected error while compiling and building PHP.',
            'See ERROR log above.'
        );
        return false
    }
    try {
        // const usedPHPVersion = await execAsync('phpbrew info | grep "PHP Version"')

        const usedPHPVersion = await execAsync('php -v | grep ^PHP')
        if (!requiredPHPVersionRegex.test(usedPHPVersion)) {
            // Sometimes a bug happens and it returns an error
            await execAsync(`phpbrew use php-${requiredPHPVersion}`);
            output.info(`Using php version ${requiredPHPVersion}`)
        }
    } catch (e) {
        output.fail(e.message)

        logger.error(
            'Unexpected error while switching to required PHP.',
            'See ERROR log above.'
        );

        return false
    }

    output.start('Installing gd PHP extension')
    await execAsyncWithCallback('phpbrew ext install gd', {
        callback: logger.log
    });

    output.start('Installing intl PHP extension')
    await execAsync('phpbrew ext install intl');

    output.succeed('PHP installed!')

    return true
};

module.exports = installPHP;
