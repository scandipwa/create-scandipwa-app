const { StylesOption } = require('@scandipwa/scandipwa-development-toolkit-core');

const withExtendOptions = (yargs) => yargs
    .option('styles', {
        describe: 'Styles option',
        alias: 's',
        type: 'string',
        choices: Object.values(StylesOption)
    });

module.exports = withExtendOptions;
