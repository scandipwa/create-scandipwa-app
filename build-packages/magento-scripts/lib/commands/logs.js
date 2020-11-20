module.exports = (yargs) => {
    yargs.command('logs', 'Display application logs.', () => {}, (argv) => {
        console.log('m2 lgs', argv);
    });
};
