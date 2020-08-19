#!/usr/bin/env node

/* eslint-disable no-console */

const spawn = require('cross-spawn');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');

const args = process.argv.slice(2);

if (args.length === 0) {
    // eslint-disable-next-line no-console
    console.log('Please specify command (one of: "start", "build").');
    process.exit(1);
}

// eslint-disable-next-line fp/no-let
let child = null;

/**
 * Added path to hard-coded CRACO configuration file
 */
const spawnUndead = (isNoBrowser = false) => {
    /**
     * Send:
     * - SIGKILL to kill child and parent immediately
     * - SIGINT to restart, in case for example
     * - anything else to kill parent immediately
     */
    child = spawn(
        require.resolve('@scandipwa/craco/bin/craco'),
        [
            ...args,
            '--config', path.join(__dirname, '../craco.config.js')
        ],
        {
            stdio: 'inherit',
            env: {
                ...process.env,
                BROWSER: isNoBrowser ? 'none' : ''
            }
        }
    );

    child.on('error', () => {
        child.kill('SIGKILL');
    });

    child.on('exit', (_, signal) => {
        switch (signal) {
        case 'SIGINT':
            console.log(chalk.bgYellow('New override detected – restarting...'));
            spawnUndead(true);
            break;
        case 'SIGKILL':
        default:
            process.exit();
        }
    });
};

process.on('exit', () => {
    child.kill('SIGKILL');
});

spawnUndead();

const killChild = () => {
    child.kill('SIGINT'); // could be bad on Windows
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
