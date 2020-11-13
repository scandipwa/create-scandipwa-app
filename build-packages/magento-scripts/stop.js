const { Listr } = require('listr2');
const { stopPhpFpmTask } = require('./tasks/php-fpm');
const {
    stopDockerContainersTask,
    removeDockerContainersTask
} = require('./tasks/docker');

const stop = async () => {
    const tasks = new Listr([
        stopPhpFpmTask,
        {
            title: 'Stopping Docker services',
            task: async (ctx, task) => task.newListr([
                stopDockerContainersTask,
                removeDockerContainersTask
            ], {
                concurrent: false,
                exitOnError: true
            })
        }
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        }
    });

    await tasks.run();
};

module.exports = stop;
