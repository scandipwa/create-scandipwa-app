const runMagentoCommand = require('../util/run-magento');
const config = require('../config');

module.exports = async () => {
    await runMagentoCommand(`deploy:mode:set ${ config.app.mode } --skip-compilation`);

    if (config.app.mode === 'production') {
        await runMagentoCommand('setup:di:compile');
        await runMagentoCommand('setup:static-content:deploy');
    }
};
