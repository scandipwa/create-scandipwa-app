const runMagentoCommand = require('../util/run-magento');
const config = require('../config');

module.exports = async (ports) => {
    const { mysql: { env } } = config.docker.getContainers(ports);

    // TODO: wait for MySQL

    await runMagentoCommand(`setup:config:set \
        --db-host='127.0.0.1:${ ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ config.app.adminuri }' \
        -n`);

    // TODO: handle error
};
