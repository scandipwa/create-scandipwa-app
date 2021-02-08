/* eslint-disable */
const { ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');
const withTargetDirectory = require('../../common/options/withTargetDirectory');
const withExtendOptions = require('./lib/options/withExtendOptions');

const extender = require('./lib/extender');

module.exports = (yargs) => {
    yargs.command('override <resource type>', 'Override an existing resource', (yargs) => {
        yargs.command(
            'component <name>',
            'Override a component',
            (yargs) => withTargetDirectory(withExtendOptions(yargs)),
            extender(ResourceType.Component)
        );

        yargs.command(
            'route <name>',
            'Override a route',
            (yargs) => withTargetDirectory(withExtendOptions(yargs)),
            extender(ResourceType.Route)
        );
        
        yargs.command(
            'store <name>',
            'Override a store',
            (yargs) => withTargetDirectory(withExtendOptions(yargs)),
            extender(ResourceType.Store)
        );

        yargs.command(
            'query <name>',
            'Override a query',
            (yargs) => withTargetDirectory(withExtendOptions(yargs)),
            extender(ResourceType.Query)
        );
    });
};
