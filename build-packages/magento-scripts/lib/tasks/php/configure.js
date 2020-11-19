/* eslint-disable no-param-reassign */
const { php } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

const configure = {
    title: 'Configuring PHP extensions',
    task: async (ctx, task) => {
        const loadedModules = await execAsyncSpawn(`${ php.binPath } -m`);
        const missingExtensions = php.extensions.filter(({ name }) => !loadedModules.includes(name));

        if (missingExtensions.length === 0) {
        // if all extensions are installed - do not configure PHP
            task.skip();
            return;
        }

        try {
            // eslint-disable-next-line no-restricted-syntax
            for (const { name, options } of missingExtensions) {
                // eslint-disable-next-line no-await-in-loop
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext install ${ name }${ options ? ` -- ${ options }` : ''}`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                });
            }
        } catch (e) {
            task.report(e);
            throw new Error('Something went wrong during the extension installation.');
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = configure;
