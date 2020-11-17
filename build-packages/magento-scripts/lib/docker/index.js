const containers = require('./containers');
const network = require('./network');
const volumes = require('./volumes');

const startServices = {
    title: 'Start docker services',
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
// async (ctx, task) => {
//         try {
//             await startNetwork();
//         } catch (e) {
//             logger.logN(e);

//             logger.error(
//                 'Failed to start docker network, can not proceed.',
//                 'Please see the error above.'
//             );

//             logger.note(
//                 'We would appreciate an issue on GitHub :)'
//             );

//             process.exit();
//         }

//         try {
//             await startVolumes();
//         } catch (e) {
//             logger.logN(e);

//             logger.error(
//                 'Failed to create docker volumes, can not proceed.',
//                 'Please see the error above.'
//             );

//             logger.note(
//                 'We would appreciate an issue on GitHub :)'
//             );

//             process.exit();
//         }

//         try {
//             await startContainers(ports);
//         } catch (e) {
//             logger.logN(e);

//             logger.error(
//                 'Failed to start docker containers, can not proceed.',
//                 'Please see the error above.'
//             );

//             logger.note(
//                 'We would appreciate an issue on GitHub :)'
//             );

//             process.exit();
//         }
//     }
// };

const stopServices = {
    title: 'Stopping Docker services',
    task: async (ctx, task) => task.newListr([
        containers.stopContainers,
        containers.removeContainers
    ], {
        concurrent: false,
        exitOnError: true
    })
};

module.exports = {
    startServices,
    stopServices
};
