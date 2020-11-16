/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../util/run-magento');
const { config: { magentoDir } } = require('../config');
const { pathExists } = require('fs-extra');

const uninstallMagento = {
    title: 'Uninstall Magento App',
    task: async (ctx, task) => {
        const appFolderExists = await pathExists(magentoDir);
        if (!appFolderExists) {
            task.skip();
            return;
        }

        const { result: setupDbStatus } = await runMagentoCommand('setup:db:status');

        if (setupDbStatus.includes('the Magento application is not installed')) {
            return;
        }
        await runMagentoCommand('setup:uninstall', {
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: Infinity
    }
};

module.exports = uninstallMagento;
