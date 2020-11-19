const runMagentoCommand = require('../../util/run-magento');

module.exports = {
    title: 'Disabling maintenance mode',
    task: async () => {
        await runMagentoCommand('maintenance:disable');
        await runMagentoCommand('info:adminuri');
    }
};
