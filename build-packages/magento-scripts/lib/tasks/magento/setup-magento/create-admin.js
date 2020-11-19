const runMagentoCommand = require('../../util/run-magento');
const { app } = require('../../config');

const answers = ['Couldn\'t find the user account', 'was not locked or could not be unlocked'];

module.exports = {
    title: 'Creating admin user',
    task: async (ctx, task) => {
        const { result: userStatus } = await runMagentoCommand(`admin:user:unlock ${app.user} -n`);

        if (answers.some((a) => userStatus.includes(a))) {
            task.skip();
            return;
        }

        await runMagentoCommand(`admin:user:create \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }'`, {
            throwNonZeroCode: false
        });
    }
};
