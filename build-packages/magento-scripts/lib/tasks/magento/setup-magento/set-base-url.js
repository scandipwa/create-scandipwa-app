const runMagentoCommand = require('../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async (ctx) => {
        const { ports } = ctx;
        await runMagentoCommand(`setup:store-config:set --base-url="http://localhost:${ ports.app }"`);
        await runMagentoCommand(`setup:store-config:set --base-url-secure="https://localhost:${ ports.app }"`);
        await runMagentoCommand('setup:store-config:set --use-secure=0');
        await runMagentoCommand('setup:store-config:set --use-secure-admin=0');
    }
};
