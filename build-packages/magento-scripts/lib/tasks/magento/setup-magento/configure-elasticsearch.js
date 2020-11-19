const runMagentoCommand = require('../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async () => {
        await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
            throwNonZeroCode: false
        });
        await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname localhost', {
            throwNonZeroCode: false
        });
    }
};
