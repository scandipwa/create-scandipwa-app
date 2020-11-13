module.exports = (yargs) => {
    yargs.command('link', 'Link with ScandiPWA application.', () => {}, (argv) => {
        console.log('m2 lnk', argv);
    });
};
