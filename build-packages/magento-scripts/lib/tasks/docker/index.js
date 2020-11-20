const containers = require('./containers');
const network = require('./network');
const volumes = require('./volumes');

const startServices = {
    title: 'Starting docker services',
    task: async (ctx, task) => task.newListr([
        network.createNetwork,
        volumes.createVolumes,
        containers.startContainers
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

const stopServices = {
    title: 'Stopping Docker services',
    task: async (ctx, task) => task.newListr([
        containers.stopContainers
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

module.exports = {
    startServices,
    stopServices
};
