const componentOptions = (yargs) => yargs
    .option('business-logic', {
        describe: 'Contains business logic',
        alias: 'b',
        type: 'boolean',
        default: false
    })
    .option('connected', {
        describe: 'Connected to the global state',
        alias: 'c',
        type: 'boolean',
        default: false
    });

module.exports = componentOptions;
