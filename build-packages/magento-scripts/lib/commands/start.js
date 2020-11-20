/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const start = require('../tasks/start');
const stop = require('../tasks/stop');

module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        // yargs.option(
        //     'detached',
        //     {
        //         alias: 'd',
        //         describe: 'Run application in detached mode.',
        //         type: 'boolean',
        //         default: false
        //     }
        // );

        yargs.option(
            'restart',
            {
                alias: 'r',
                describe: 'Restart deployed application.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        );
    }, async (args = {}) => {
        const listrTasks = [
            start
        ];

        if (args.restart) {
            listrTasks.unshift(stop);
        }
        const tasks = new Listr(listrTasks, {
            exitOnError: true,
            ctx: { ...args },
            concurrent: false,
            rendererOptions: { collapse: false }
        });

        try {
            await tasks.run();
        } catch (e) {
            tasks.err.forEach((error) => {
                logger.error(error);
            });
        }
    });
};
