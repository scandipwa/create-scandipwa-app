const runMagentoCommand = require('../util/run-magento');
const installMagento = require('./install-magento');

const getDbStatus = async (isReturnLogs) => {
    try {
        return await runMagentoCommand('setup:db:status', isReturnLogs);
    } catch (e) {
        return e;
    }
};

module.exports = async (ports) => {
    const dbStatus = await getDbStatus();

    if (dbStatus.includes('Magento application is not installed')) {
        installMagento(ports);
    }

    switch (dbStatus) {
    case 1:
    case 0:
    default:
        // TODO: handle these statuses ?
        break;
    case 2:
        await runMagentoCommand('setup:upgrade');
    }
};
