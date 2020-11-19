const runMagentoCommand = require('../../util/run-magento');
const { docker, app } = require('../../config');
const waitForIt = require('../../util/wait-for-it');

module.exports = {
    title: 'Setting mysql magento database credentials',
    task: async (ctx, task) => {
        const { mysql: { env } } = docker.getContainers(ctx.ports);

        await waitForIt({
            name: 'mysql',
            host: '127.0.0.1',
            port: ctx.ports.mysql,
            output: (t) => {
                // eslint-disable-next-line no-param-reassign
                task.output = t;
            }
        });

        // TODO: handle error
        await runMagentoCommand(`setup:config:set \
        --db-host='127.0.0.1:${ ctx.ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ app.adminuri }' \
        -n`, {
            throwNonZeroCode: false
        });
    },
    options: {
        bottomBar: 10
    }
};
