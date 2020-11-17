const { Listr } = require('listr2');
const { stopPhpFpmTask } = require('../../tasks/php-fpm');
const { stopServices } = require('../docker');

module.exports = (yargs) => {
    yargs.command('stop', 'Stop the application.', () => {}, async () => {
        const tasks = new Listr([
            stopPhpFpmTask,
            stopServices
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            }
        });

        await tasks.run();
    });
};
