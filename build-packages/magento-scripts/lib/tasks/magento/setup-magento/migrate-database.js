/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');
const installMagento = require('./install-magento');

const migrateDatabase = {
    title: 'Migrating database',
    task: async ({ ports, magentoVersion, magentoConfig: app }, task) => {
        const { code } = await runMagentoCommand('setup:db:status', {
            magentoVersion,
            throwNonZeroCode: false
        });

        switch (code) {
        case 0: {
            // No upgrade/install is needed
            task.skip();
            break;
        }
        case 1: {
            await installMagento({ ports, magentoVersion, app });
            break;
        }
        case 2: {
            task.output = 'Upgrading magento';
            await runMagentoCommand('setup:upgrade', {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
            task.output = 'Magento upgraded!';
            break;
        }
        default: {
        // TODO: handle these statuses ?
            task.output = 'Database migration failed: manual action is required!';
            break;
        }
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = migrateDatabase;
