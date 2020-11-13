#!/usr/bin/env node

const { program } = require('@caporal/core');
const exitHook = require('async-exit-hook');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const { stopServices } = require('../lib/steps/manage-docker-services');
const { stopPhpFpm } = require('../lib/steps/manage-php-fpm');

const commands = {
    start: require('../start'),
    stop: require('../stop'),
    cleanup: require('../clean-up'),
    restart: require('../restart'),
    theme: require('../lib/manage-theme'),
    run: {
        magento: require('../lib/util/run-magento'),
        composer: require('../lib/util/run-composer')
    },
    cli: require('../magento-cli')
};

let done = false;

global.verbose = false;

const actionWrapper = (action, { useExitHook = true, useVerbose } = {}) => async (ctx) => {
    global.verbose = useVerbose || ctx.options.verbose || false;
    if (!useExitHook) {
        done = true;
    }
    await action(ctx);

    done = true;
};

program
    .name('ScandiPWA BE Scripts')
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
    .action(actionWrapper(({ options }) => commands.cleanup(options)))
    .command('install-theme', 'Install ScandiPWA theme')
    .argument('<theme path>', 'Theme path')
    .action(actionWrapper(({ args }) => commands.theme.installTheme(args, { logOutput: true }), {
        useExitHook: false,
        useVerbose: true
    }))
    .command('composer', 'Run composer command')
    .argument('[command...]', 'Composer command')
    .action(actionWrapper((ctx) => {
        logger.logN(`> composer ${ctx.args.command.join(' ')}`);
        return commands.run.composer.runComposerCommand(ctx.args.command.join(' '), { logOutput: true });
    }, {
        useExitHook: false,
        useVerbose: true
    }))
    .command('magento', 'Run magento command')
    .argument('[command...]', 'Magento command')
    .action(actionWrapper((ctx) => {
        logger.logN(`> magento ${ctx.args.command.join(' ')}`);
        return commands.run.magento.runMagentoCommand(ctx.args.command.join(' '), { logOutput: true });
    }, {
        useExitHook: false,
        useVerbose: true
    }))
    .command('cli', 'Run bash with local aliases to php, magento and composer')
    .action(actionWrapper(() => commands.cli(), { useExitHook: false }));

const exitProgram = () => {
    process.exit(0);
};
const stopProgram = async () => {
    await stopServices();
    await stopPhpFpm({ output: logger.log });
    exitProgram();
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
        exitProgram();
    } catch (e) {
        logger.error(e);
        await stopProgram();
        process.exit(1);
    }
};

main();
