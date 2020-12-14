const spawn = require('cross-spawn');
const path = require('path');
const debounce = require('debounce');
const chokidar = require('chokidar');
const kill = require('tree-kill');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { before } = require('./build-plugins');

const args = process.argv.slice(2);

module.exports = (script) => {
    before.forEach((beforeRun) => beforeRun(script));

    const isProd = script === 'build';
    const localeArgIndex = args.indexOf('--locale');
    const locale = localeArgIndex === -1 ? 'en_US' : args[localeArgIndex + 1];

    // check if the locale matches expected Regex
    if (!/^[a-z]{2}_[A-Z]{2}$/.test(locale)) {
        logger.error(
            'The locale format is wrong.',
            `The argument ${ logger.style.misc('--locale') } is expected to match following pattern:`,
            logger.style.command('<2 digit language code>_<2 digit country code (in uppercase)>'),
            `The value received: ${ logger.style.misc(locale) }.`
        );

        process.exit(1);
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
                stdio: ['inherit', 'inherit', 'inherit'],
                env: {
                    ...process.env,
                    // after restart do not launch new browser, and by default
                    // start new session based on env variable value
                    BROWSER: isRestarted ? 'none' : (process.env.BROWSER || ''),
                    FAST_REFRESH: true,
                    FORCE_COLOR: true,
                    PWA_LOCALE: locale,
                    ...(isProd ? { GENERATE_SOURCEMAP: false } : {})
                }
            }
        );

        // TODO: can we auto-connect hot-reload back?
        // TODO: remove production build reference to React

        child.on('error', (e) => {
            logger.log('error', e);
            process.exit();
        });

        child.on('close', (code) => {
            if (code !== null || isProd) {
                // if the process exits "voluntarily" stop the parent as well
                // See more in answer here: https://stackoverflow.com/a/39169784
                process.exit();
            }
        });
    };

    process.on('exit', () => {
        if (child) {
            kill(child.pid, 'SIGTERM');
        }
    });

    spawnUndead();

    if (!isProd) {
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
                'src/**/*.js',
                'src/**/*.scss'
            ], {
                // should we ignore node_modules ?
                ignored: '**/node_modules/**',
                cwd: process.cwd(),
                ignoreInitial: true
            })
            .on('add', killChild)
            .on('unlink', killChild)
            .on('addDir', killChild)
            .on('unlinkDir', killChild);
    }
};
