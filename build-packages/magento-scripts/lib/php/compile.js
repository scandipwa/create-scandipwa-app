const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const config = require('../config');

const compile = async () => {
    try {
        await execCommandAsync(
            `phpbrew install -j $(nproc) ${ config.php.version } \
                +bz2 +bcmath +ctype +curl -intl +dom +filter +hash \
                +iconv +json +mbstring +openssl +xml +mysql \
                +pdo +soap +xmlrpc +xml +zip +fpm +gd \
                -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ \
                --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/ --with-libdir=lib64`,
            process.cwd()
        );
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Failed to compile the required PHP version.',
            `Tried compiling the PHP version ${ logger.style.misc(config.php.version) }.`,
            'Use your favorite search engine to resolve the issue.',
            'Most probably you are missing some dependencies.',
            'See error details in the output above.'
        );

        logger.note(
            'We would appreciate an issue on GitHub :)'
        );

        process.exit();
    }
};

module.exports = compile;
