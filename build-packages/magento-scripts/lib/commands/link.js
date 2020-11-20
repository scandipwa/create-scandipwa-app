const { Listr } = require('listr2');
const linkTheme = require('../tasks/theme/link-theme');

module.exports = (yargs) => {
    yargs.command('link', 'Link with ScandiPWA application.', () => {}, async () => {
        const tasks = new Listr([
            linkTheme
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: { throwMagentoVersionMissing: true },
            rendererOptions: { collapse: false }
        });

        await tasks.run();
    });
};
