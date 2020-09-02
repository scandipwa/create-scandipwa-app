#!/usr/bin/env node

const spawn = require('cross-spawn');
const path = require('path');
const debounce = require('debounce');
const chokidar = require('chokidar');
const kill = require('tree-kill');
const clearConsole = require('react-dev-utils/clearConsole');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { isValidComposer } = require('@scandipwa/scandipwa-dev-utils/composer');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex((x) => x === 'build' || x === 'start');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const isProd = script === 'build';
const isMagento = args.indexOf('--magento') !== -1;

if (isMagento) {
    logger.note(
        'Building as a Magento theme!',
        `The ${ logger.style.file('public/index.html') } file content will not be taken into account!`,
        `Using content of ${ logger.style.file('public/index.php') } instead!`
    );
}

const TIMEOUT_BETWEEN_KILL_TRIGGERS = 500;

if (args.length === 0) {
    logger.error(`Please specify command (one of: ${ logger.style.misc('start') }, ${ logger.style.misc('build') }).`);
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

        // Simply clear the console
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
        if (/folder is ready to be deployed|bit\.ly\/CRA-deploy|Find out more about deployment|You may serve it with a static|serve -s|Could not resolve/gm.test(string)) {
            return;
        }

        logger.log(string);

        /**
         * Show warning to reload the browser
         */
        if (isRestarted && string.includes('To create a production')) {
            logger.note('Reload the page to see results!');
        }
    });

    child.on('close', () => {
        if (isProd) {
            process.exit();
        }
    });
};

process.on('exit', () => {
    if (child) {
        kill(child.pid, 'SIGTERM');
    }
});

if (!isValidComposer()) {
    process.exit();
}

spawnUndead();

const killChild = debounce(() => {
    kill(child.pid, 'SIGTERM', (err) => {
        if (err) {
            logger.log(err);
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
