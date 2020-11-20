const { pathExists } = require('fs-extra');
const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');

const getProcessId = async (fpmPidFilePath) => {
    const pidExists = await pathExists(fpmPidFilePath);

    if (pidExists) {
        return fs.promises.readFile(fpmPidFilePath, 'utf-8');
    }

    return null;
};

const stopPhpFpmTask = {
    title: 'Stopping php-fpm',
    task: async ({ config: { php } }, task) => {
        try {
            const processId = await getProcessId(php.fpmPidFilePath);
            if (!processId) {
                task.skip();
                return;
            }
            await execAsyncSpawn(`kill ${processId} && rm -f ${php.fpmPidFilePath}`);
        } catch (e) {
            if (e.message.includes('No such process')) {
                await execAsyncSpawn(`rm -f ${php.fpmPidFilePath}`);
                return;
            }

            task.report(e);

            throw new Error(
                `Unexpected error while stopping php-fpm.
                See ERROR log above.`
            );
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = stopPhpFpmTask;
