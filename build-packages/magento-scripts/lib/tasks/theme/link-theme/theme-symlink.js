const { runComposerCommand } = require('../../util/run-composer');

const themeSymlink = {
    title: 'Setting symbolic link for theme in composer',
    task: async (ctx, task) => {
        const { absoluteThemePath } = ctx;
        try {
            await runComposerCommand(`config repo.scandipwa path ${absoluteThemePath}`, {
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            task.report(e);

            throw new Error(
                `Unexpected error while configuring theme symbolic link.
                See ERROR log above.`
            );
        }
    }
};

module.exports = themeSymlink;
