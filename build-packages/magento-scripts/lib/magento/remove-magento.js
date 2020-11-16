const { pathExists } = require('fs-extra');
const fs = require('fs');
const { config } = require('../config');

const removeMagento = {
    title: 'Remove magento application folder',
    task: async (ctx, task) => {
        const appPathExists = await pathExists(config.magentoDir);

        if (appPathExists && ctx.force) {
            await fs.promises.rmdir(config.magentoDir, {
                recursive: true
            });

            return;
        }

        task.skip();
    }
};

module.exports = removeMagento;
