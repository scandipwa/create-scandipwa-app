const { php, pidFilePath } = require('../config');
const { execAsync, execAsyncSpawn } = require('../util/exec-async-command');
const getProcessId = require('../util/get-process-id');

const stopPhpFpm = async ({ output }) => {
    try {
        const processId = await getProcessId();
        if (processId) {
            output('Stopping php-fpm...');
            await execAsync(`kill ${processId} && rm -f ${pidFilePath}`);
            output('php-fpm stopped!');
        }
    } catch (e) {
        if (e.message.includes('No such process')) {
            await execAsync(`rm -f ${pidFilePath}`);
            return;
        }

        output(
            'Unexpected error while stopping php-fpm.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const startPhpFpm = async ({ output }) => {
    await stopPhpFpm({ output });
    output('Starting php-fpm...');
    try {
        await execAsyncSpawn(
            `${php.phpFpmBinPath} --php-ini ${php.phpIniPath} --fpm-config ${php.phpFpmConfPath} --pid ${pidFilePath} "$@"`,
            {
                callback: output
            }
        );

        output('php-fpm started up!');
    } catch (e) {
        output(
            'Unexpected error while deploying php-fpm.',
            'See ERROR log above.'
        );

        throw e;
    }
};

module.exports = { startPhpFpm, stopPhpFpm };
