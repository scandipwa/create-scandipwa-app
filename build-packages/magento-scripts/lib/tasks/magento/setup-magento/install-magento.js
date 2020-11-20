const runMagentoCommand = require('../../../util/run-magento');

module.exports = async ({ ports, magentoVersion, app }) => {
    await runMagentoCommand(`setup:install \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }' \
        --search-engine='elasticsearch7' \
        --elasticsearch-host='localhost' \
        --elasticsearch-port='${ ports.elasticsearch }'`, {
        magentoVersion
    });

    await runMagentoCommand('cache:enable', {
        magentoVersion
    });
};
