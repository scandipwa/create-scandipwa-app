const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Disabling maintenance mode',
    task: async ({ magentoVersion }) => {
        await runMagentoCommand('maintenance:disable', { magentoVersion });
        await runMagentoCommand('info:adminuri', { magentoVersion });
    }
};
