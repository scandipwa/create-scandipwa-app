const flushRedisConfig = require('./flush-redis-config');
const configureMysql = require('./configure-mysql');
const migrateDatabase = require('./migrate-database');
const configureRedis = require('./configure-redis');
const configureElasticsearch = require('./configure-elasticsearch');
const createAdmin = require('./create-admin');
const setDeploymentMode = require('./set-deployment-mode');
const setBaseUrl = require('./set-base-url');
const postDeploy = require('./post-deploy');

module.exports = async (ports) => {
    await flushRedisConfig(ports);
    await configureMysql(ports);
    await migrateDatabase(ports);
    await configureRedis(ports);
    await configureElasticsearch(ports);
    await createAdmin(ports);
    await setDeploymentMode(ports);
    await setBaseUrl(ports);
    await postDeploy(ports);
};
