const { execAsync } = require('../util/exec-async-command');
const { php: { phpBinPath }, magento: { magentoBinPath }, docker } = require('../config');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { getCachedPorts } = require('../util/get-ports');

/**
 * Execute magento command
 * @param {String} command magento command
 */
const runMagentoCommand = async (command) => execAsync(`${phpBinPath} ${magentoBinPath} ${command}`);

const magentoFlushConfig = async ({ output }) => {
    output.start('Flushing Magento redis cache...');
    const { name: redisName } = docker.container.redis();
    const result = await runMagentoCommand(`docker exec -t ${redisName} redis-cli -h ${redisName} 0 flushdb`);

    if (result === 'OK') {
        return true;
    }

    output.fail('Unexpected result from redis flush');
    logger.log(result);

    return false;
};

const magentoDatabaseConfig = async ({ output }) => {
    const ports = await getCachedPorts();
    output.start('Setting magento database credentials');

    await runMagentoCommand(`setup:config:set \
    --db-host ${MYSQL_HOST} \
    --db-name ${MYSQL_DATABASE} \
    --db-user ${MYSQL_USER} \
    --db-password ${MYSQL_PASSWORD} \
    --backend-frontname ${MAGENTO_ADMINURI} \
    -n`);

    await runMagentoCommand(`setup:config:set \
    --pq-host=redis \
    --pq-port=${ports.redis} \
    --pq-database=5 \
    --pq-scheme=tcp \
    -n`);
};

const magentoDatabaseMigration = async ({ output }) => {
    /**
     *  Check if magento already installed or not, ignoring exit statuses of eval, since it's magento subprocess
     */
    const magentoStatus = await runMagentoCommand('setup:db:status');

    /**
     * We cannot rely on Magento Code, as these are update codes, not install codes. Therefore check the output for
     * the specific message!
     */
    if (magentoStatus.includes('Magento application is not installed')) {
        await runMagentoCommand(`setup:install \
        --admin-firstname ${MAGENTO_FIRST_NAME} \
        --admin-lastname ${MAGENTO_LAST_NAME} \
        --admin-email ${MAGENTO_EMAIL} \
        --admin-user ${MAGENTO_USER} \
        --admin-password ${MAGENTO_PASSWORD}`);
    }
};

const setupMagento = async () => {
    const output = ora('Setting up magento...').start();

    await magentoFlushConfig({ output });
};

module.exports = setupMagento;
