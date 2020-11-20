/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../util/exec-async-command');

const startPhpFpm = {
    title: 'Starting php-fpm',
    task: async ({ config: { php } }, task) => {
        try {
            await execAsyncSpawn(
                `${php.fpmBinPath} --php-ini ${php.iniPath} --fpm-config ${php.fpmConfPath} --pid ${php.fpmPidFilePath} "$@"`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            task.report(e);
            throw new Error('Error during php-fpm start');
        }
    },
    options: {
        bottomBar: 5
    }
};

module.exports = startPhpFpm;
