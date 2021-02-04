/* eslint-disable no-console */
const { ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');

const creator = require('./lib/creator');
const componentOptions = require('./lib/options/componentOptions');
const storeOptions = require('./lib/options/storeOptions');

module.exports = (yargs) => {
    yargs.command('create <resource type>', 'Create a new resource', (yargs) => {
        yargs.command('component <name>', 'Create a component', componentOptions, creator(ResourceType.Component));
        yargs.command('route <name>', 'Create a route', componentOptions, creator(ResourceType.Route));
        yargs.command('store <name>', 'Create a store', storeOptions, creator(ResourceType.Store));
    });
};
