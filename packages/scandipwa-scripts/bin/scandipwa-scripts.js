#!/usr/bin/env node
/* eslint-disable fp/no-let */

const path = require('path');
const chokidar = require('chokidar');
const forever = require('forever-monitor');

const args = process.argv.slice(2);

if (args.length === 0) {
    // eslint-disable-next-line no-console
    console.log('Please specify command (one of: "start", "build").');
    process.exit(1);
}

const child = forever.start([
    require.resolve('@scandipwa/craco/bin/craco'),
    ...args,
    '--config',
    path.join(__dirname, '../craco.config.js')
], {
    cwd: process.cwd(),
    args: ['--color']
});

const killChild = () => {
    child.restart();
    // TODO: set env BROWSER=none
};

chokidar
    .watch([
        path.join(process.cwd(), 'src/**/*.js'),
        path.join(process.cwd(), 'src/**/*.scss')
    ], {
        ignored: path.join(process.cwd(), 'node_modules'),
        ignoreInitial: true
    })
    .on('add', killChild)
    .on('unlink', killChild)
    .on('addDir', killChild)
    .on('unlinkDir', killChild);

process.on('exit', () => {
    child.kill();
});
