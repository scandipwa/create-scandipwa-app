#!/usr/bin/env node

/* eslint-disable no-console */

const spawn = require('cross-spawn');
const path = require('path');
const debounce = require('debounce');
const chokidar = require('chokidar');
const chalk = require('chalk');
const kill = require('tree-kill');
const clearConsole = require('react-dev-utils/clearConsole');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex((x) => x === 'build' || x === 'start');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const isProd = script === 'build';
const isMagento = args.indexOf('--magento') !== -1;

if (isMagento) {
    console.log(
        `${ chalk.bgKeyword('orange').black('WARNING!') } Building as a Magento theme! `
        + `The ${ chalk.underline.cyan('public/index.html') } file content will not be taken into account! `
        + `Using content of ${ chalk.underline.cyan('public/index.php') } instead!`
    );
}

const TIMEOUT_BETWEEN_KILL_TRIGGERS = 500;

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
const spawnUndead = (isRestarted = false) => {
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
            stdio: ['inherit', 'pipe', 'inherit'],
            env: {
                ...process.env,
                BROWSER: isRestarted ? 'none' : '',
                FORCE_COLOR: true,
                PWA_BUILD_MODE: isMagento ? 'magento' : 'storefront',
                ...(isProd ? { GENERATE_SOURCEMAP: false } : {})
            }
        }
    );

    child.stdout.on('data', (output) => {
        const string = output.toString();

        // Simply clear the console.
        if (/Starting the development server/gm.test(string)) {
            clearConsole();
            return;
        }

        // Clear the console, but print the error
        if (/Compiled successfully|Failed to compile/gm.test(string)) {
            clearConsole();
        }

        // Simply print nothing
        // eslint-disable-next-line max-len
        if (/folder is ready to be deployed|bit\.ly\/CRA-deploy|Find out more about deployment|You may serve it with a static|serve -s/gm.test(string)) {
            return;
        }

        console.log(string);

        /**
         * Show warning to reload the browser
         */
        if (isRestarted && string.includes('To create a production')) {
            console.log(chalk.yellow('Reload the page to see results!'));
        }
    });

    child.on('close', () => {
        if (isProd) {
            process.exit();
        }
    });
};

process.on('exit', () => {
    kill(child.pid, 'SIGTERM');
});

spawnUndead();

const killChild = debounce(() => {
    kill(child.pid, 'SIGTERM', (err) => {
        if (err) {
            console.log(err);
        }

        spawnUndead(true);
    });
}, TIMEOUT_BETWEEN_KILL_TRIGGERS);

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
