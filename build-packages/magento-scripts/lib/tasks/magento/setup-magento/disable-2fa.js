const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Disabling 2fa for admin.',
    task: async ({ magentoVersion }) => {
        // Disable 2FA due admin login issue
        await runMagentoCommand('module:disable Magento_TwoFactorAuth', {
            magentoVersion
        });
        await runMagentoCommand('cache:flush', {
            magentoVersion
        });
    }
};
