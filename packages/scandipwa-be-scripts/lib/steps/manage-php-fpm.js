const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const { php, pidFilePath } = require('../config');
const { execAsync } = require('../util/exec-async');
const getProcessId = require('../util/get-process-id');

const startPhpFpm = async () => {
    const output = ora('Deploying php-fpm...').start();
    try {
        await execAsync(`${php.phpFpmBinPath} --php-ini ${php.phpIniPath} --fpm-config ${php.phpFpmConfPath} --pid ${pidFilePath} "$@"`);
        /**
         * --php-ini ${PHPBREW_ROOT}/php/${PHP_BUILD}/etc/php.ini \
                  --fpm-config ${PHPBREW_ROOT}/php/${PHP_BUILD}/etc/php-fpm.conf \
                  --pid ${PHPFPM_PIDFILE} \
                  "$@"
         */
        output.succeed('php-fpm started up!');
        return true;
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while deploying php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }
};

const stopPhpFpm = async ({ output }) => {
    try {
        const processId = await getProcessId();
        if (processId) {
            output.start('Stopping php-fpm...');
            await execAsync(`kill ${processId}`);
            // await execAsync(`${php.phpFpmBinPath} stop`);
            await execAsync(`rm -f ${pidFilePath}`);
            output.succeed('php-fpm stopped!');
            /** if [[ ${PHPBREW_PHP} =~ ${regex} ]]; then
                ${PHPFPM_BIN} stop
              elif [[ -e ${PHPFPM_PIDFILE} ]] ; then
                echo "Stopping php-fpm..."
                kill $(cat ${PHPFPM_PIDFILE})
                rm -f ${PHPFPM_PIDFILE}
              fi  */
        } else {
            output.warn('php-fpm is not running');
        }
    } catch (e) {
        if (e.message.includes('No such process')) {
            await execAsync(`rm -f ${pidFilePath}`);
            return true;
        }
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while stopping php-fpm.',
            'See ERROR log above.'
        );

        return false;
    }

    return true;
};

module.exports = { startPhpFpm, stopPhpFpm };
