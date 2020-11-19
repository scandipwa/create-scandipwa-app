const { Listr } = require('listr2');
const { removeCacheFolder } = require('../cache');
const { stopServices } = require('../docker');
const { removeVolumes } = require('../docker/volumes');
const {
    uninstallMagento,
    removeMagento
} = require('../magento');
const { stopPhpFpm } = require('../php-fpm');

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
            const tasks = new Listr([
                stopPhpFpm,
                stopServices,
                removeVolumes,
                removeCacheFolder,
                uninstallMagento,
                removeMagento
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
