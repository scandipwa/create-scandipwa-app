const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const cleanup = require('../tasks/cleanup');

module.exports = (yargs) => {
    yargs.command(
        'cleanup',
        'Cleanup project folder',
        (yargs) => yargs.option(
            'force',
            {
                alias: 'f',
                describe: 'Force cleanup to remove app directory',
                type: 'boolean',
                default: false
            }
        ),
        async (args) => {
            logger.warn('you should not use this command.');
            const tasks = new Listr([
                cleanup
            ], {
                concurrent: false,
                exitOnError: true,
                ctx: { force: args.force },
                rendererOptions: { collapse: false }
            });

            await tasks.run();
        }
    );
};
