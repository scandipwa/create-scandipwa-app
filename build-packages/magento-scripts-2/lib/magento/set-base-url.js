const runMagentoCommand = require('../util/run-magento');

module.exports = async (ports) => {
    await runMagentoCommand(`setup:store-config:set --base-url="http://localhost:${ ports.app }"`);
    await runMagentoCommand(`setup:store-config:set --base-secure-url="https://localhost:${ ports.app }"`);
    await runMagentoCommand('setup:store-config:set --use-secure=1');
    await runMagentoCommand('setup:store-config:set --use-secure-admin=1');
};
