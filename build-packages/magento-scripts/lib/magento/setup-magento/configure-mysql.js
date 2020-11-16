const runMagentoCommand = require('../../util/run-magento');
const config = require('../config');
const waitForIt = require('../../util/wait-for-it');

module.exports = async (ports, output) => {
    output('Setting mysql magento database credentials');
    const { mysql: { env } } = config.docker.getContainers(ports);

    // TODO: wait for MySQL

    await waitForIt({
        name: 'mysql',
        host: '127.0.0.1',
        port: ports.mysql,
        output
    });

    // TODO: handle error
    await runMagentoCommand(`setup:config:set \
        --db-host='127.0.0.1:${ ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ config.app.adminuri }' \
        -n`);

    output('Magento database credentials are set!');
};
