/* eslint-disable no-param-reassign */
const fs = require('fs');
const { pathExists } = require('fs-extra');
const { composer, php } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

const getComposerVersion = async () => {
    const composerVersionOutput = await execAsyncSpawn(`${php.binPath} ${composer.binPath} --version --no-ansi`);
    const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];
    return composerVersion;
};

const createComposerDir = async () => {
    const dirExists = await pathExists(composer.dirPath);
    if (!dirExists) {
        await fs.promises.mkdir(dirExists, { recursive: true });
    }
};

const installComposer = {
    title: 'Installing composer',
    task: async (ctx, task) => {
        const hasComposerInCache = await pathExists(composer.binPath);

        if (!hasComposerInCache) {
            task.title = 'Installing Composer';
            await createComposerDir();
            try {
                await execAsyncSpawn(
                    `${ php.binPath } -r "copy('https://getcomposer.org/composer-1.phar', '${ composer.binPath }');"`
                );
            } catch (e) {
                task.report(
                    new Error(
                        'Unexpected issue, while installing composer.',
                        'Please see the error log below.'
                    )
                );
                throw e;
                // logger.note(
                //     'We would appreciate an issue on GitHub :)'
                // );
            }
        }

        const composerVersion = await getComposerVersion();
        task.title = `Using composer version ${composerVersion}`;
    }
};

module.exports = { installComposer };
