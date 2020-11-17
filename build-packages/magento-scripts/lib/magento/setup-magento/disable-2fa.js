const runMagentoCommand = require('../../util/run-magento');

module.exports = {
    title: 'Disabling 2fa for admin.',
    task: async () => {
        // Disable 2FA due admin login issue
        await runMagentoCommand('module:disable Magento_TwoFactorAuth');
        await runMagentoCommand('cache:flush');
    }
};
