module.exports = (yargs) => {
    yargs.command('override <command>', 'Override a file', (yargs) => {
        yargs.command('theme', 'Select a parent theme as a target.', () => {}, (argv) => {
            console.log('ovr pth', argv);
        });

        yargs.command('extension', 'Select an extension as a target.', () => {}, (argv) => {
            console.log('ovr ext', argv);
        });
    });
};
