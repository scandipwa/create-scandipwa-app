module.exports = (yargs) => {
    yargs.command('stop', 'Stop the application.', () => {}, (argv) => {
        console.log('m2 stp', argv);
    });
};
