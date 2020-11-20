const { Listr } = require('listr2');
const stop = require('../tasks/stop');

module.exports = (yargs) => {
    yargs.command('stop', 'Stop the application.', () => {}, async () => {
        const tasks = new Listr([
            stop
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
