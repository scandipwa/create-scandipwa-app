const runMagentoCommand = require('../../util/run-magento');
const installMagento = require('./install-magento');

const migrateDatabase = async (ports, output) => {
    const { code } = await runMagentoCommand('setup:db:status', { throwNonZeroCode: false });

    switch (code) {
    case 0: {
        output('No upgrade/install is needed');
        break;
    }
    case 1: {
        await installMagento(ports);
        break;
    }
    case 2: {
        output('Upgrading magento');
        await runMagentoCommand('setup:upgrade', {
            callback: output
        });
        output('Magento upgraded!');
        break;
    }
    default: {
        // TODO: handle these statuses ?
        output('Database migration failed: manual action is required!');
        break;
    }
    }
};

module.exports = migrateDatabase;
