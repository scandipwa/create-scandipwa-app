const { Listr } = require('listr2');
const { stopServices } = require('../docker');
const { stopPhpFpm } = require('../php-fpm');

module.exports = (yargs) => {
    yargs.command('stop', 'Stop the application.', () => {}, async () => {
        const tasks = new Listr([
            stopPhpFpm,
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
