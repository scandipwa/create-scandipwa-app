const runMagentoCommand = require('../../util/run-magento');

module.exports = {
    title: 'Configuring redis',
    task: async (ctx) => {
        await runMagentoCommand(`setup:config:set \
        --cache-backend='redis' \
        --cache-backend-redis-server='127.0.0.1' \
        --cache-backend-redis-port='${ ctx.ports.redis }' \
        --cache-backend-redis-db='0' \
        -n`);

        await runMagentoCommand(`setup:config:set \
        --session-save=redis \
        --session-save-redis-host='127.0.0.1' \
        --session-save-redis-port='${ ctx.ports.redis }' \
        --session-save-redis-log-level='3' \
        --session-save-redis-max-concurrency='30' \
        --session-save-redis-db='1' \
        --session-save-redis-disable-locking='1' \
        -n`);
    }
};
