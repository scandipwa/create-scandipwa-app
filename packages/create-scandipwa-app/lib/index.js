#!/usr/bin/env node

const { program } = require('@caporal/core');
const spawn = require('cross-spawn');

program
    .argument('<app name>', 'ScandiPWA package name to create')
    .option('--template <type>', 'Template to use', {
        default: 'theme',
        validator: ['theme', 'magento']
    })
    .action(({ args, options }) => {
        const { appName } = args;
        const { template } = options;

        spawn.sync(
            'yo',
            [`scandipwa:${ template }`, appName],
            { stdio: 'inherit' }
        );
    });

program.run();
