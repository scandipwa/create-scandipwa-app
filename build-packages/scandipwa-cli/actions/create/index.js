/* eslint-disable no-console */
const { ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');

const componentOptions = require('./lib/options/componentOptions');
const storeOptions = require('./lib/options/storeOptions');
const componentCreator = require('./lib/creator');

module.exports = (yargs) => {
    yargs.command('create <resource type>', 'Create a new resource', (yargs) => {
        yargs.command('component <name>', 'Create a component', componentOptions, componentCreator(ResourceType.Component));
        yargs.command('route <name>', 'Create a route', componentOptions, componentCreator(ResourceType.Route));
        yargs.command('store <name>', 'Create a store', storeOptions, componentCreator(ResourceType.Store));
    });
};
