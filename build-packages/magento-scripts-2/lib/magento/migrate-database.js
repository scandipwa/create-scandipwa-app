const runMagentoCommand = require('../util/run-magento');
const installMagento = require('./install-magento');

const getDbStatus = async (isReturnLogs) => {
    try {
        return await runMagentoCommand('setup:db:status', isReturnLogs);
    } catch (e) {
        return e;
    }
};
const migrateDatabase = async (ports) => {
    const dbStatus = await getDbStatus();

    switch (dbStatus) {
    case 1:
        await installMagento(ports);
        break;
    case 2:
        await runMagentoCommand('setup:upgrade');
        break;
    case 0:
    default:
        // TODO: handle these statuses ?
        break;
    }
};

module.exports = migrateDatabase;
