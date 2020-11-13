/* eslint-disable no-param-reassign */
const {
    checkComposerAuth,
    checkComposerInCache,
    getComposerVersion,
    installComposerInCache
} = require('../lib/steps/install-composer');

exports.checkComposerTask = {
    title: 'Checking composer',
    task: async (ctx, task) => {
        const isComposerAuthOk = await checkComposerAuth();

        if (!isComposerAuthOk) {
            throw new Error('COMPOSER_AUTH env variable is not found');
        }

        const hasComposerInCache = await checkComposerInCache();

        if (hasComposerInCache) {
            const composerVersion = await getComposerVersion();
            task.title = `Using composer version ${composerVersion}`;
            return;
        }

        task.title = 'Installing Composer';

        await installComposerInCache();

        const composerVersion = await getComposerVersion();
        task.title = `Using composer version ${composerVersion}`;
    }
};
