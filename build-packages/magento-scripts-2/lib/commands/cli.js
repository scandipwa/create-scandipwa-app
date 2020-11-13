module.exports = (yargs) => {
    yargs.command('cli', 'Enter CLI (magento, php, composer).', () => {}, (argv) => {
        console.log('m2 lnk', argv);
    });
};
