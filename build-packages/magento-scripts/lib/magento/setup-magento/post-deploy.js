const runMagentoCommand = require('../util/run-magento');

module.exports = async () => {
    await runMagentoCommand('maintenance:disable');
    await runMagentoCommand('info:adminuri');

    // Disable 2FA due admin login issue
    await runMagentoCommand('module:disable Magento_TwoFactorAuth');
    await runMagentoCommand('cache:flush');
};
