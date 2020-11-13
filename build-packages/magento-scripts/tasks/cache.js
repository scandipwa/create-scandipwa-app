/* eslint-disable no-param-reassign */
const { cachePath } = require('../lib/config');
const {
    checkCacheFolder,
    createCacheFolder
} = require('../lib/steps/prepare-fs');
const { execAsync } = require('../lib/util/exec-async-command');
const pathExists = require('../lib/util/path-exists');

exports.createCacheFolderTask = {
    title: 'Checking cache folder',
    task: async (ctx, task) => {
        const cacheFolderOk = await checkCacheFolder();

        if (cacheFolderOk) {
            task.title = 'Cache folder created!';
            task.skip('Cache folder already created!');
        } else {
            await createCacheFolder();
            task.title = 'Cache folder is created.';
        }
    }
};

exports.removeCacheFolderTask = {
    title: 'Cleaning cache',
    task: async (ctx, task) => {
        const cacheExists = await pathExists(cachePath);
        if (!cacheExists) {
            task.skip();
            return;
        }

        await execAsync(`rm -rf ${cachePath}`);
    }
};
