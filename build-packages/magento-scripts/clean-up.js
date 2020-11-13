/* eslint-disable no-param-reassign */
const { Listr } = require('listr2');
const { removeCacheFolderTask } = require('./tasks/cache');
const { stopDockerContainersTask, removeDockerContainersTask, removeDockerVolumesTask } = require('./tasks/docker');
const { uninstallMagentoTask, removeMagentoFolderTask } = require('./tasks/magento');
const { stopPhpFpmTask } = require('./tasks/php-fpm');

const cleanUp = async ({ force = false } = {}) => {
    const tasks = new Listr([
        stopPhpFpmTask,
        {
            title: 'Removing docker services',
            task: async (ctx, task) => task.newListr([
                stopDockerContainersTask,
                removeDockerContainersTask,
                removeDockerVolumesTask
            ], {
                concurrent: false,
                exitOnError: true
            })
        },
        removeCacheFolderTask,
        uninstallMagentoTask,
        removeMagentoFolderTask
    ], {
        concurrent: false,
        exitOnError: true,
        ctx: { force }
    });

    await tasks.run();
};

module.exports = cleanUp;
