const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async ({ ports, magentoVersion }) => {
        await runMagentoCommand(`setup:store-config:set --base-url="http://localhost:${ ports.app }"`, { magentoVersion });
        await runMagentoCommand(`setup:store-config:set --base-url-secure="https://localhost:${ ports.app }"`, { magentoVersion });
        await runMagentoCommand('setup:store-config:set --use-secure=0', { magentoVersion });
        await runMagentoCommand('setup:store-config:set --use-secure-admin=0', { magentoVersion });
    }
};
