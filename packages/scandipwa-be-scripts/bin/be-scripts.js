#!/usr/bin/env node

const path = require('path');
const { program } = require('@caporal/core');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');
const ora = require('ora');
const exitHook = require('async-exit-hook');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const { stopServices } = require('../lib/steps/manage-docker-services');
const { stopPhpFpm } = require('../lib/steps/manage-php-fpm');

const commands = {
    start: require('../start'),
    stop: require('../stop'),
    cleanup: require('../clean-up'),
    restart: require('../restart'),
    init: require('../init')
};

let done = false;

const oraInstance = ora();

global.verbosity = 1;

global.output = {
    ...oraInstance,
    start(text, verbosityLevel = 3) {
        if (verbosity <= verbosityLevel) {
            return oraInstance.start(text);
        }

        return oraInstance;
    },
    info(text, verbosityLevel = 3) {
        if (verbosity <= verbosityLevel) {
            return oraInstance.info(text);
        }

        return oraInstance;
    },
    warn(text, verbosityLevel = 3) {
        if (verbosity <= verbosityLevel) {
            return oraInstance.warn(text);
        }

        return oraInstance;
    },
    succeed(text, verbosityLevel = 3) {
        if (verbosity <= verbosityLevel) {
            return oraInstance.succeed(text);
        }

        return oraInstance;
    },
    fail(text, verbosityLevel = 3) {
        if (verbosity <= verbosityLevel) {
            return oraInstance.fail(text);
        }

        return oraInstance;
    }
};

const actionWrapper = (action) => async (ctx) => {
    global.verbose = Number.parseInt(ctx.options.verbose, 2) || 1;

    await action(ctx);

    done = true;
};

program
    .name('Create Magento App')
    .argument('<app name>', 'Magento application name to create')
    .action(({ args }) => {
        const pathArr = (args.appName || '').split('/');
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

        return commands.init(options);
    })
    .option('--verbose', 'Set verbose level, default 1', {
        global: true,
        validator: program.NUMBER,
        default: 1
    })
    .command('start', 'Start Magento with all services')
    .action(actionWrapper(({ options }) => commands.start(options)))
    .command('stop', 'Stop Magento and services')
    .action(actionWrapper(({ options }) => commands.stop(options)))
    .command('restart', 'Restart Magento and services')
    .action(actionWrapper(({ options }) => commands.restart(options)))
    .command('cleanup', 'Cleanup project, uninstall Magento')
    .option('-f, --force', '[with cleanup] additionally removes Magento folder.')
    .action(actionWrapper(({ options }) => commands.cleanup(options)));

const stopProgram = async () => {
    await stopServices();
    await stopPhpFpm();
};

exitHook(async (callback) => {
    if (done) {
        callback();
        return;
    }
    stopProgram();
});

const main = async () => {
    try {
        await program.run();
        process.exit(0);
    } catch (e) {
        logger.error(e);
        await stopProgram();
        process.exit(1);
    }
};

main();
