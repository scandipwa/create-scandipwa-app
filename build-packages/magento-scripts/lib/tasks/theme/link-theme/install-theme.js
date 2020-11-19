/* eslint-disable no-param-reassign */
const runComposerCommand = require('../../util/run-composer');

const installTheme = {
    title: 'Installing theme',
    task: async (ctx, task) => {
        const { composerData } = ctx;
        try {
            await runComposerCommand(`require ${composerData.name}`, {
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            task.report(e);

            throw new Error(
                `Unexpected error while installing theme.
                See ERROR log above.`
            );
        }
    }
};

module.exports = installTheme;
