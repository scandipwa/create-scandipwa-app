const { stopServices } = require('./docker');
const getMagentoVersion = require('./magento/get-magento-version');
const { stopPhpFpm } = require('./php-fpm');

const stop = {
    title: 'Stopping project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersion,
        stopPhpFpm,
        stopServices
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

module.exports = stop;
