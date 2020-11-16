const runMagentoCommand = require('../../util/run-magento');
const { app } = require('../../config');

module.exports = async (ports, output) => {
    await runMagentoCommand(`admin:user:unlock ${ app.user }`);

    await runMagentoCommand(`admin:user:create \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }'`);

    output(`User ${app.user} created`);
};
