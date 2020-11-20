const runMagentoCommand = require('../util/run-magento');
const config = require('../config');

module.exports = async (ports) => {
    await runMagentoCommand(`setup:install \
        --admin-firstname='${ config.app.first_name }' \
        --admin-lastname='${ config.app.last_name }' \
        --admin-email='${ config.app.email }' \
        --admin-user='${ config.app.user }' \
        --admin-password='${ config.app.password }' \
        --search-engine='elasticsearch7' \
        --elasticsearch-host='localhost' \
        --elasticsearch-port='${ ports.elasticsearch }'`);

    await runMagentoCommand('cache:enable');
};
