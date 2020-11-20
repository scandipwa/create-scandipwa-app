const { removeCacheFolder } = require('./cache');
const { stopServices } = require('./docker');
const { removeVolumes } = require('./docker/volumes');
const {
    uninstallMagento,
    removeMagento
} = require('./magento');
const getMagentoVersion = require('./magento/get-magento-version');
const { stopPhpFpm } = require('./php-fpm');

const cleanup = {
    title: 'Cleanup project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersion,
        stopPhpFpm,
        stopServices,
        removeVolumes,
        removeCacheFolder,
        uninstallMagento,
        removeMagento
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = cleanup;
