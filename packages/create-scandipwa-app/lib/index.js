#!/usr/bin/env node

const { program } = require('@caporal/core');
const yeoman = require('yeoman-environment');

program
    .argument('<app name>', 'ScandiPWA package name to create')
    .option('--template <type>', 'Template to use', {
        default: 'theme',
        validator: ['theme', 'magento']
    })
    .action(({ args: { appName: name }, options: { template } }) => {
        const env = yeoman.createEnv();
        env.register(require.resolve(`@scandipwa/generator/generators/${ template }/index.js`));
        env.run(`scandipwa:${ template } ${ name }`);
    });

program.run();
