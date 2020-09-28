#!/usr/bin/env node

const path = require('path');
const { program } = require('@caporal/core');
const validatePackageName = require('validate-npm-package-name');
const init = require('./create-scandipwa-app');

program
    .argument('<app name>', 'ScandiPWA package name to create', {
        validator: (value) => {
            const name = value.startsWith('@') ? value : value.split('/').pop();

            const {
                validForNewPackages: isValidPackageName = true,
                errors = []
            } = validatePackageName(name);

            if (isValidPackageName) {
                return value;
            }

            if (errors.length) {
                throw new Error(
                    `The package name '${ value }' breaks following rules: \n`
                    + errors.map((e, i) => `${ ++i }) ${ e }`).join('\n')
                );
            }

            throw new Error('The package name is invalid!');
        }
    })
    .option('--template <type>', 'Template to use', {
        default: 'theme',
        validator: ['theme', 'extension']
    })
    .action(({ args: { appName: name }, options: { template } }) => {
        const pathArr = name.split('/');
        const orgPathArray = pathArr.slice(-2);

        /**
         * In case pathArr is something like ['projects', '@scandipwa', 'test']
         * it should return '@scandipwa/test' as name as 'projects/test' as path.
         */
        if (orgPathArray[0].startsWith('@')) {
            return {
                name: path.join(...orgPathArray),
                path: path.join(...pathArr.slice(0, -2), orgPathArray[1])
            }
        }

        const options = {
            name: pathArr[pathArr.length - 1],
            path: path.join(...pathArr),
            template
        };

        init(options);
    });

program.run();
