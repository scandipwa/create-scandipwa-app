const runMagentoCommand = require('../../util/run-magento');
const { app } = require('../../config');

module.exports = {
    title: 'Creating admin user',
    task: async (ctx, task) => {
        const { result: userStatus } = await runMagentoCommand(`admin:user:unlock ${app.user}`);
        if (!userStatus.includes('Couldn\'t find the user account')) {
            task.skip();
            return;
        }

        await runMagentoCommand(`admin:user:create \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }'`);
    }
};
