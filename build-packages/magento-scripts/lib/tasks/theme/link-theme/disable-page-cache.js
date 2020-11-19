/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../util/run-magento');

const disablePageCache = {
    title: 'Disabling full_page cache',
    task: async (ctx, task) => {
        try {
            await runMagentoCommand('cache:disable full_page', {
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            task.report(e);

            throw new Error(
                `Unexpected error while disabling full page cache.
                See ERROR log above.`
            );
        }
    }
};

module.exports = disablePageCache;
