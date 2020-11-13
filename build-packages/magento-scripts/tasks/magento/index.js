/* eslint-disable no-param-reassign */
const fs = require('fs');
const {
    checkMagentoApp,
    installApp
} = require('../lib/steps/install-magento');
const { runMagentoCommandSafe, runMagentoCommand } = require('../lib/util/run-magento');
const setupMagento = require('../lib/steps/setup-magento');
const pathExists = require('../lib/util/path-exists');
const { appPath } = require('../lib/config');

exports.installMagentoTask = {
    title: 'Installing magento app',
    task: async (ctx, task) => {
        const hasMagentoApp = await checkMagentoApp();

        if (hasMagentoApp) {
            task.skip();
            return;
        }

        await installApp({
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.uninstallMagentoTask = {
    title: 'Uninstall Magento App',
    task: async (ctx, task) => {
        const appFolderExists = await pathExists(appPath);
        if (!appFolderExists) {
            task.skip();
            return;
        }

        const { result: setupDbStatus } = await runMagentoCommand('setup:db:status', {
            withCode: true
        });

        if (setupDbStatus.includes('the Magento application is not installed')) {
            return;
        }
        await runMagentoCommandSafe('setup:uninstall', {
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: Infinity
    }
};

exports.setupMagentoTask = {
    title: 'Setup magento',
    task: async (ctx, task) => {
        await setupMagento({
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

exports.removeMagentoFolderTask = {
    title: 'Remove magento application folder',
    task: async (ctx, task) => {
        const appPathExists = await pathExists(appPath);

        if (appPathExists && ctx.force) {
            await fs.promises.rmdir(appPath, {
                recursive: true
            });

            return;
        }

        task.skip();
    }
};
