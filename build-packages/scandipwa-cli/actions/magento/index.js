module.exports = (yargs) => {
    yargs.command('magento <command>', 'Interact with Magento', (yargs) => {
        yargs.command('cli', 'Open an interactive console.', () => {}, (argv) => {
            console.log('m2 cli', argv);
        });

        yargs.command('logs', 'Show logs of Magento and belonging services.', () => {}, (argv) => {
            console.log('m2 lgs', argv);
        });

        yargs.command('link', 'Link Magneto 2 with ScandiPWA application.', () => {}, (argv) => {
            console.log('m2 lnk', argv);
        });
    });
};
