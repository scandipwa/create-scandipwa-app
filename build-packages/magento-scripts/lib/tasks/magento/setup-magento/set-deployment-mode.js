const runMagentoCommand = require('../../util/run-magento');
const { app } = require('../../config');

module.exports = {
    title: 'Switching magento mode',
    task: async () => {
        await runMagentoCommand(`deploy:mode:set ${ app.mode } --skip-compilation`);

        if (app.mode === 'production') {
            await runMagentoCommand('setup:di:compile');
            await runMagentoCommand('setup:static-content:deploy');
        }
    }
};
