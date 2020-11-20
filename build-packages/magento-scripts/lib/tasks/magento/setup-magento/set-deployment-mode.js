const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Switching magento mode',
    task: async ({ magentoVersion, magentoConfig: app }) => {
        await runMagentoCommand(`deploy:mode:set ${ app.mode } --skip-compilation`, { magentoVersion });

        if (app.mode === 'production') {
            await runMagentoCommand('setup:di:compile', { magentoVersion });
            await runMagentoCommand('setup:static-content:deploy', { magentoVersion });
        }
    }
};
