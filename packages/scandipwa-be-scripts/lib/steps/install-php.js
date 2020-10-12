const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync } = require('../util/exec-async');
const packageExists = require('../util/package-exists');

const installPHP = async () => {
    logger.logN('Checking PHP');

    try {
        await packageExists('phpbrew');
        // TODO: check package in node_modules (installed to .scandipwa folder)
    } catch (e) {
        // TODO: install PHP brew to node_modules/.scandipwa
        logger.error(
            `Package ${ logger.style.misc('phpbrew') } is not installed!`,
            'To install, follow this instructions: https://github.com/phpbrew/phpbrew/wiki/Quick-Start'
        );

        process.exit();
    }

    const requiredPHPVersion = '7.3.22';

    if (!/7\.3\.22/.test(await execAsync('phpbrew list'))) {
        logger.logN('Compile and build PHP');

        try {
            await execAsync(
                `phpbrew install ${ requiredPHPVersion }
                +bz2 +bcmath +ctype +curl +dom +filter +hash
                +iconv +json +mbstring +openssl +xml +mysql
                +pdo +soap +xmlrpc +xml +zip +fpm`
            );
        } catch (e) {
            logger.logN(e);

            logger.error(
                'Unexpected error while installing the PHP.',
                'See ERROR log above.'
            );

            process.exit();
        }
    }

    // Sometimes a bug happens and it returns an error
    try {
        await execAsync('phpbrew use php-7.3.22');
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Unexpected error while switching to required PHP.',
            'See ERROR log above.'
        );

        process.exit();
    }

    await execAsync('phpbrew ext install gd');
    await execAsync('phpbrew ext install intl');
};

module.exports = installPHP;
