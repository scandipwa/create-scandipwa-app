const fs = require('fs');
const { pathExists } = require('fs-extra');
const { config } = require('../config');

const removeCacheFolder = {
    title: 'Cleaning cache',
    task: async (ctx, task) => {
        const cacheExists = await pathExists(config.cacheDir);
        if (!cacheExists) {
            task.skip();
            return;
        }

        await fs.promises.rmdir(config.cacheDir, {
            recursive: true
        });
    }
};

module.exports = removeCacheFolder;
