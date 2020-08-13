#!/usr/bin/env node

const spawn = require('cross-spawn');
const path = require('path');
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Please specify command (one of: "start", "build").');
    process.exit(1);
}

/**
 * Added path to hard-coded CRACO configuration file
 */
const child = spawn.sync(
    require.resolve('@craco/craco/bin/craco'),
    [
        ...args,
        '--config', path.join(__dirname, '../craco.config.js'),
        // '--resolve-path', path.join(__dirname, '..')
    ],
    { stdio: 'inherit' }
);

process.exit(child.status);
