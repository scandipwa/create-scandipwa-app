/* eslint-disable no-param-reassign */
const fs = require('fs');
const { pathExists } = require('fs-extra');
const { execAsyncSpawn } = require('../../util/exec-async-command');

const getComposerVersion = async ({ composer, php }) => {
    const composerVersionOutput = await execAsyncSpawn(`${php.binPath} ${composer.binPath} --version --no-ansi`);
    const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];
    return composerVersion;
};

const createComposerDir = async ({ composer }) => {
    const dirExists = await pathExists(composer.dirPath);
    if (!dirExists) {
        await fs.promises.mkdir(composer.dirPath, { recursive: true });
    }
};

const installComposer = {
    title: 'Installing composer',
    task: async ({ config }, task) => {
        const { composer, php } = config;
        const hasComposerInCache = await pathExists(composer.binPath);

        if (!hasComposerInCache) {
            task.title = 'Installing Composer';
            await createComposerDir({ composer });
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

        const composerVersion = await getComposerVersion({ composer, php });
        task.title = `Using composer version ${composerVersion}`;
    }
};

module.exports = { installComposer };
