const withTargetDirectory = (yargs) => yargs
    .option('target-module', {
        describe: 'Module to generate functionality in',
        alias: 't',
        type: 'string'
    });

module.exports = withTargetDirectory;
