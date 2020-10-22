const { execAsync } = require('../util/exec-async-command');
const { php: { phpBinPath }, magento: { magentoBinPath }, docker } = require('../config');
const ora = require('ora');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { getCachedPorts } = require('../util/get-ports');
const { defaultConfig, getApplicationConfig } = require('../util/application-config');

/**
 * Execute magento command
 * @param {String} command magento command
 */
const runMagentoCommand = async (command) => execAsync(`${phpBinPath} ${magentoBinPath} ${command}`);

const magentoFlushConfig = async ({ output }) => {
    output.start('Flushing Magento redis cache...');
    const { name: redisName } = docker.container.redis();
    const cmd = `docker exec -t ${redisName} redis-cli -h ${redisName} -n 0 flushdb`;
    const result = await execAsync(cmd);

    if (result.includes('OK')) {
        return true;
    }

    output.fail('Unexpected result from redis flush');

    logger.error('Used command', cmd);

    throw new Error(result);
};

const magentoDatabaseConfig = async ({ output, config }) => {
    const ports = await getCachedPorts();
    output.start('Setting magento database credentials');

    const { env } = docker.container.mysql();

    await runMagentoCommand(`setup:config:set \
    --db-host 127.0.0.1:${ports.mysql} \
    --db-name ${env.MYSQL_DATABASE} \
    --db-user ${env.MYSQL_USER} \
    --db-password ${env.MYSQL_PASSWORD} \
    --backend-frontname ${config.magento.adminuri} \
    -n`);
    output.succeed('Magento database credentials are set!');

    // output.start('Setting redis for persisted query(PWA)');
    // await runMagentoCommand(`setup:config:set \
    // --pq-host=redis \
    // --pq-port=${ports.redis} \
    // --pq-database=5 \
    // --pq-scheme=tcp \
    // -n`);
    // output.succeed('Redis setup!');
};

const magentoDatabaseMigration = async ({ output, config }) => {
    /**
     *  Check if magento already installed or not, ignoring exit statuses of eval, since it's magento subprocess
     */
    const magentoStatus = await runMagentoCommand('setup:db:status');

    /**
     * We cannot rely on Magento Code, as these are update codes, not install codes. Therefore check the output for
     * the specific message!
     */

    let magentoDBStatus = '0';
    if (magentoStatus.includes('Magento application is not installed')) {
        await runMagentoCommand(`setup:install \
        --admin-firstname ${config.magento.first_name} \
        --admin-lastname ${config.magento.last_name} \
        --admin-email ${config.magento.email} \
        --admin-user ${config.magento.username} \
        --admin-password ${config.magento.password}`);
    } else {
        magentoDBStatus = await runMagentoCommand('setup:db:status');
        output.info(`DB Status: ${magentoDBStatus}`);
    }

    switch (magentoDBStatus) {
    case '1': {
        output.fail('Cannot upgrade: manual action is required!');
        break;
    }
    case '2': {
        output.info('Upgrading magento');
        await runMagentoCommand('setup:upgrade');
        break;
    }
    case '0': {
        output.info('No upgrade/install is needed');
        break;
    }
    default: {
        output.fail('Database migration failed: manual action is required!');
    }
    }
};

const magentoRedisConfig = async ({ output }) => {
    output.info('Setting redis as config cache');

    await runMagentoCommand('setup:config:set --cache-backend=redis --cache-backend-redis-server=redis --cache-backend-redis-db=0 -n');

    output.info('Setting redis as session storage');

    // Redis for sessions
    await runMagentoCommand('setup:config:set --session-save=redis --session-save-redis-host=redis --session-save-redis-log-level=3 --session-save-redis-max-concurrency=30 --session-save-redis-db=1 --session-save-redis-disable-locking=1 -n');

    // Elasticsearch5 as a search engine
    output.info('Setting Elasticsearch7 as a search engine');
    await runMagentoCommand('config:set catalog/search/engine elasticsearch7');

    // elasticsearch container as a host name
    output.info('Setting elasticsearch as a host name for Elasticsearch5');
    await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname elasticsearch');
    await runMagentoCommand('cache:enable');
};

const createAdminUser = async ({ output, config }) => {
    output.info('Checking user $MAGENTO_USER');
    const userStatus = await runMagentoCommand(`admin:user:unlock ${config.magento.user}`);
    if (userStatus.includes('Couldn\'t find the user account')) {
        await runMagentoCommand(`admin:user:create \
        --admin-firstname ${config.magento.first_name} \
        --admin-lastname ${config.magento.last_name} \
        --admin-email ${config.magento.email} \
        --admin-user ${config.magento.username} \
        --admin-password ${config.magento.password}`);

        output.info(`User ${config.magento.username} created`);
    }
};

const magentoSetMode = async ({ output, config }) => {
    // Set Magento mode

    if (defaultConfig.magento.mode) {
        output.info('Switching magento mode');
        await runMagentoCommand(`deploy:mode:set ${config.magento.mode} --skip-compilation`);
    }
};

const magentoCompile = async ({ output }) => {
    if (defaultConfig.magento.mode === 'production') {
        output.info('Generating DI and assets');
        await runMagentoCommand('setup:di:compile');
        await runMagentoCommand('setup:static-content:deploy');
    }
};

const magentoPostDeploy = async ({ output }) => {
    output.info('Flushing caches');
    await runMagentoCommand('cache:flush');

    output.info('Disabling maintenance mode');
    await runMagentoCommand('maintenance:disable');
    await runMagentoCommand('info:adminuri');
};

const magentoSetupSteps = [
    magentoFlushConfig,
    magentoDatabaseConfig,
    magentoDatabaseMigration,
    magentoRedisConfig,
    createAdminUser,
    magentoSetMode,
    magentoCompile,
    magentoPostDeploy
];

const setupMagento = async () => {
    const output = ora('Setting up magento...').start();

    const appConfig = await getApplicationConfig();

    if (!appConfig) {
        output.warn('Application config not found');
        process.exit(1);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const step of magentoSetupSteps) {
        try {
        // eslint-disable-next-line no-await-in-loop
            await step({ output, config: appConfig });
        } catch (e) {
            output.fail(e.message);
            logger.error(e);

            logger.error('Unexpected error during magento setup.');
            process.exit(1);
        }
    }
};

module.exports = setupMagento;
