/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../util/run-magento');
const installMagento = require('./install-magento');

const migrateDatabase = {
    title: 'Migrating database',
    task: async (ctx, task) => {
        const { code } = await runMagentoCommand('setup:db:status', {
            throwNonZeroCode: false
        });

        switch (code) {
        case 0: {
            // No upgrade/install is needed
            task.skip();
            break;
        }
        case 1: {
            await installMagento(ctx.ports);
            break;
        }
        case 2: {
            task.output = 'Upgrading magento';
            await runMagentoCommand('setup:upgrade', {
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
