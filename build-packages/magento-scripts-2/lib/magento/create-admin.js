const runMagentoCommand = require('../util/run-magento');
const config = require('../config');

module.exports = async () => {
    await runMagentoCommand(`admin:user:unlock ${ config.app.user }`);

    await runMagentoCommand(`admin:user:create \
        --admin-firstname='${ config.app.first_name }' \
        --admin-lastname='${ config.app.last_name }' \
        --admin-email='${ config.app.email }' \
        --admin-user='${ config.app.user }' \
        --admin-password='${ config.app.password }'`);
};
