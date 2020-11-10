#!/usr/bin/env node

const path = require('path');
const { program } = require('@caporal/core');
const init = require('./create-magento-app');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');

program
    .name('Create Magento App')
    .argument('<app name>', 'Magento App package name to create')
    .action(({
        args: {
            appName: name = ''
        }
    }) => {
        const pathArr = name.split(path.sep);
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

        return init(options);
    });

program.run()
    .catch(console.log);
