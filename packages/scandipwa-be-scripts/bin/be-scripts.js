#!/usr/bin/env node

const path = require('path');
const { program } = require('@caporal/core');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');

const commands = {
    start: require('../start'),
    stop: require('../stop'),
    cleanup: require('../clean-up'),
    restart: require('../restart'),
    init: require('../init')
};

program
    .argument('<app name>', 'Magento application name to create')
    .action(({ args }) => {
        const pathArr = (args.appName || '').split('/');
        const orgPathArray = pathArr.slice(-2);
        const isOrg = orgPathArray[0].startsWith('@');

        const packageName = isOrg
            ? path.join(...orgPathArray)
            : pathArr[pathArr.length - 1];

        if (!isValidPackageName(packageName)) {
            process.exit();
        }

        const pathToDist = isOrg
            ? path.join(...pathArr.slice(0, -2), orgPathArray[1])
            : path.join(...pathArr);

        const options = {
            /**
             * In case pathArr is something like ['projects', '@scandipwa', 'test']
             * it should return '@scandipwa/test' as name as 'projects/test' as path.
             */
            name: packageName,
            path: pathToDist
        };

        return commands.init(options);
    })
    .command('start', 'Start Magento with all services')
    .action(() => commands.start())
    .command('stop', 'Stop Magento and services')
    .action(() => commands.stop())
    .command('restart', 'Restart Magento and services')
    .action(() => commands.restart())
    .command('cleanup', 'Cleanup project, uninstall Magento')
    .option('-f, --force', '[with cleanup] additionally removes Magento folder.')
    .action(({ options }) => commands.cleanup(options));

program.run();
