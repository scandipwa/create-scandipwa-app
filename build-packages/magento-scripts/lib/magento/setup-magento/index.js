const flushRedisConfig = require('./flush-redis-config');
const configureMysql = require('./configure-mysql');
const migrateDatabase = require('./migrate-database');
const configureRedis = require('./configure-redis');
const configureElasticsearch = require('./configure-elasticsearch');
const createAdmin = require('./create-admin');
const setDeploymentMode = require('./set-deployment-mode');
const setBaseUrl = require('./set-base-url');
const postDeploy = require('./post-deploy');

const setupMagento = {
    title: 'Setup magento',
    task: async (ctx, task) => {
        const { ports } = ctx;
        const output = (t) => {
            // eslint-disable-next-line no-param-reassign
            task.output = t;
        };

        await flushRedisConfig(ports, output);
        await configureMysql(ports, output);
        await migrateDatabase(ports, output);
        await configureRedis(ports, output);
        await configureElasticsearch(ports, output);
        await createAdmin(ports, output);
        await setDeploymentMode(ports, output);
        await setBaseUrl(ports, output);
        await postDeploy(ports, output);
    },
    options: {
        bottomBar: 10
    }
};

module.exports = setupMagento;
