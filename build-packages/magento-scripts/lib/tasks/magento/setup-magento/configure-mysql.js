const runMagentoCommand = require('../../../util/run-magento');
const waitForIt = require('../../../util/wait-for-it');

module.exports = {
    title: 'Setting mysql magento database credentials',
    task: async ({
        ports,
        magentoVersion,
        config: { docker },
        magentoConfig: app
    }, task) => {
        const { mysql: { env } } = docker.getContainers(ports);

        await waitForIt({
            name: 'mysql',
            host: '127.0.0.1',
            port: ports.mysql,
            output: (t) => {
                // eslint-disable-next-line no-param-reassign
                task.output = t;
            }
        });

        // TODO: handle error
        await runMagentoCommand(`setup:config:set \
        --db-host='127.0.0.1:${ ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ app.adminuri }' \
        -n`, {
            throwNonZeroCode: false,
            magentoVersion
        });
    },
    options: {
        bottomBar: 10
    }
};
