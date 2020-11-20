/* eslint-disable no-param-reassign */
const fs = require('fs');
const { pathExists } = require('fs-extra');
const { config } = require('../../config');

const createCacheFolder = {
    title: 'Checking cache folder',
    task: async (ctx, task) => {
        const cacheFolderExists = await pathExists(config.cacheDir);

        if (cacheFolderExists) {
            task.skip('Cache folder already created!');
            return;
        }

        await fs.promises.mkdir(config.cacheDir);
        task.title = 'Cache folder created.';
    }
};

module.exports = createCacheFolder;
