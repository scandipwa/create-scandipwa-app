const cli = require('../tasks/cli');

module.exports = (yargs) => {
    yargs.command('cli', 'Enter CLI (magento, php, composer).', () => {}, () => {
        cli();
    });
};
