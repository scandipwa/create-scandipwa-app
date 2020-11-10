#!/usr/bin/env node

const path = require('path');
const { program } = require('@caporal/core');
const init = require('./create-scandipwa-app');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');

program
    .argument('<app name>', 'ScandiPWA package name to create')
    .option('--template <type>', 'Template to use', {
        default: 'theme',
        validator: ['theme']
    })
    .action(async ({
        args: {
            appName: name = ''
        },
        options: {
            template
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
            template,
            /**
             * In case pathArr is something like ['projects', '@scandipwa', 'test']
             * it should return '@scandipwa/test' as name as 'projects/test' as path.
             */
            name: packageName,
            path: pathToDist
        };

        await init(options);
    });

program.run();
