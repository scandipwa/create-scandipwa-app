/* eslint-disable no-param-reassign */
const { execAsync } = require('../util/exec-async-command');
const { docker, appVersion } = require('../config');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { getCachedPorts } = require('../util/get-ports');
const { defaultConfig, getApplicationConfig } = require('../util/application-config');
const { runMagentoCommand, runMagentoCommandSafe } = require('../util/run-magento');
const waitForIt = require('../util/wait-for-it');

const magentoFlushConfig = async () => {
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

const magentoDatabaseConfig = async ({ config, ports }) => {
    output.start('Setting magento database credentials');

    const { env } = docker.container.mysql();

    await waitForIt({ host: '127.0.0.1', port: ports.mysql });

    await runMagentoCommand(`setup:config:set \
    --db-host='127.0.0.1:${ports.mysql}' \
    --db-name='${env.MYSQL_DATABASE}' \
    --db-user='${env.MYSQL_USER}' \
    --db-password='${env.MYSQL_PASSWORD}' \
    --backend-frontname='${config.magento.adminuri}' \
    -n`);

    output.succeed('Magento database credentials are set!');
};

const magentoDatabaseMigration = async ({ config, ports }) => {
    /**
     *  Check if magento already installed or not, ignoring exit statuses of eval, since it's magento subprocess
     */
    const magentoStatus = await runMagentoCommandSafe('setup:db:status');

    /**
     * We cannot rely on Magento Code, as these are update codes, not install codes. Therefore check the output for
     * the specific message!
     */

    const elasticsearchConfig = ` \
     --search-engine='elasticsearch7' \
     --elasticsearch-host='localhost' \
     --elasticsearch-port='${ports.elasticsearch}'
     `;

    let magentoDBStatus = '0';
    if (magentoStatus.includes('Magento application is not installed')) {
        output.start('Magento application is not installed, setting up...');
        await runMagentoCommand(`setup:install \
        --admin-firstname='${config.magento.first_name}' \
        --admin-lastname='${config.magento.last_name}' \
        --admin-email='${config.magento.email}' \
        --admin-user='${config.magento.user}' \
        --admin-password='${config.magento.password}' ${appVersion.includes('2.4') ? elasticsearchConfig : ''}`, {
            callback: (l) => l.split('\n').forEach((line) => output.info(line))
        });

        output.succeed('Magento application setup');
    } else {
        const { code } = await runMagentoCommandSafe('setup:db:status', { withCode: true });
        magentoDBStatus = code;
        output.info(`DB Status: ${magentoDBStatus}`);
    }

    switch (magentoDBStatus) {
    case 1: {
        output.fail('Cannot upgrade: manual action is required!');
        break;
    }
    case 2: {
        output.start('Upgrading magento');
        await runMagentoCommandSafe('setup:upgrade');
        break;
    }
    case 0: {
        output.info('No upgrade/install is needed');
        break;
    }
    default: {
        output.fail('Database migration failed: manual action is required!');
    }
    }
};

const magentoRedisConfig = async ({ ports }) => {
    output.start('Setting redis as config cache');

    // eslint-disable-next-line quotes
    await runMagentoCommand(`setup:config:set \
        --cache-backend='redis' \
        --cache-backend-redis-server='127.0.0.1' \
        --cache-backend-redis-port='${ports.redis}' \
        --cache-backend-redis-db='0' \
        -n`);

    output.text = 'Setting redis as session storage';

    // Redis for sessions
    // eslint-disable-next-line quotes
    await runMagentoCommand(`setup:config:set \
        --session-save=redis \
        --session-save-redis-host='127.0.0.1' \
        --session-save-redis-port='${ports.redis}' \
        --session-save-redis-log-level='3' \
        --session-save-redis-max-concurrency='30' \
        --session-save-redis-db='1' \
        --session-save-redis-disable-locking='1' \
        -n`);

    // Elasticsearch5 as a search engine
    output.text = 'Setting Elasticsearch7 as a search engine';
    await runMagentoCommand('config:set catalog/search/engine elasticsearch7');

    // elasticsearch container as a host name
    output.text = 'Setting elasticsearch as a host name for Elasticsearch5';
    await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname elasticsearch');
    await runMagentoCommand('cache:enable');
};

const createAdminUser = async ({ config }) => {
    output.start(`Checking user ${config.magento.user}`);
    const userStatus = await runMagentoCommand(`admin:user:unlock ${config.magento.user}`);
    if (userStatus.includes('Couldn\'t find the user account')) {
        await runMagentoCommand(`admin:user:create \
        --admin-firstname='${config.magento.first_name}' \
        --admin-lastname='${config.magento.last_name}' \
        --admin-email='${config.magento.email}' \
        --admin-user='${config.magento.user}' \
        --admin-password='${config.magento.password}'`);

        output.succeed(`User ${config.magento.user} created`);
    }
};

const magentoSetMode = async ({ config }) => {
    // Set Magento mode

    if (defaultConfig.magento.mode) {
        output.start('Switching magento mode');
        await runMagentoCommand(`deploy:mode:set ${config.magento.mode} --skip-compilation`);
    }
};

const magentoCompile = async () => {
    if (defaultConfig.magento.mode === 'production') {
        output.start('Generating DI and assets');
        await runMagentoCommand('setup:di:compile');
        await runMagentoCommand('setup:static-content:deploy');
    }
};

const magentoSetBaseurl = async ({ ports }) => {
    output.start(`Setting baseurl to http://localhost:${ports.app}`);
    await runMagentoCommandSafe(`setup:store-config:set --base-url="http://localhost:${ports.app}"`);

    output.text = `Setting secure baseurl to https://localhost:${ports.app}`;
    await runMagentoCommandSafe(`setup:store-config:set --base-secure-url="https://localhost:${ports.app}"`);
    await runMagentoCommand('setup:store-config:set --use-secure=1');
    await runMagentoCommand('setup:store-config:set --use-secure-admin=1');
};

const magentoPostDeploy = async () => {
    output.text = 'Flushing caches';
    await runMagentoCommand('cache:flush');

    output.text = 'Disabling maintenance mode';
    await runMagentoCommand('maintenance:disable');
    await runMagentoCommand('info:adminuri');
};

const magentoDisable2FA = async () => {
    output.text = 'Disabling 2fa for admin.';
    await runMagentoCommandSafe('module:disable Magento_TwoFactorAuth');
    await runMagentoCommandSafe('cache:flush');
};

const magentoSetupSteps = [
    magentoDisable2FA,
    magentoFlushConfig,
    magentoDatabaseConfig,
    magentoDatabaseMigration,
    magentoRedisConfig,
    createAdminUser,
    magentoSetMode,
    magentoCompile,
    magentoSetBaseurl,
    magentoPostDeploy
];

const setupMagento = async () => {
    output.start('Setting up magento...');

    const appConfig = await getApplicationConfig();
    const ports = await getCachedPorts();

    if (!appConfig) {
        output.warn('Application config not found');
        process.exit(1);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const step of magentoSetupSteps) {
        try {
        // eslint-disable-next-line no-await-in-loop
            await step({ config: appConfig, ports });
        } catch (e) {
            output.fail(e.message);
            logger.error(e);

            logger.error('Unexpected error during magento setup.');
            process.exit(1);
        }
    }
};

module.exports = setupMagento;
