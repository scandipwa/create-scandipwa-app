/* eslint-disable no-console */

const path = require('path');

const { create, ResourceType } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

// TODO implement
const getTargetModulePath = () => process.cwd();

module.exports = (yargs) => {
    yargs.command('create <resource type>', 'Create a new resource', (yargs) => {
        yargs.command('component <name>', 'Create a new component', (yargs) => yargs
            .option('business-logic', {
                describe: 'Contains business logic',
                alias: 'b',
                type: 'boolean'
            })
            .option('connected', {
                describe: 'Connected to the global state',
                alias: 'c',
                type: 'boolean'
            }),
        ({
            name,
            businessLogic = false,
            connected = false
        }) => {
            const createdFiles = create(
                ResourceType.Component,
                name,
                {
                    containerFeatures: {
                        logic: businessLogic,
                        state: connected
                    }
                },
                getTargetModulePath(),
                logger
            );

            if (!createdFiles.length) {
                return;
            }

            logger.note(
                'The following files have been created:',
                ...createdFiles.map(
                    (filepath) => logger.style.file(path.relative(process.cwd(), filepath))
                )
            );
        });
    });
};
