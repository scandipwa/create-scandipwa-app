const checkRequirements = require('../requirements');
const prepareFileSystem = require('../file-system');
const buildPhp = require('../php/build');
const installComposer = require('../composer/install');
const openBrowser = require('../util/open-browser');
const { getPorts } = require('../util/ports');
const { start: startServices } = require('../docker');
const setupMagento = require('../magento');

module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        yargs.option(
            'detached',
            {
                alias: 'd',
                describe: 'Run application in detached mode.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'restart',
            {
                alias: 'r',
                describe: 'Restart deployed application.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        );
    }, async () => {
        // Check OS platform, docker, PHPBrew
        await checkRequirements();

        // Build PHP & configure extensions
        await buildPhp();

        // Install Composer
        await installComposer();

        // Obtain free ports before deployment
        const ports = await getPorts();

        // Generate configuration files
        await prepareFileSystem(ports);

        // Start docker containers based on ports we just obtained
        await startServices(ports);

        // Run Magento 2 setup steps
        await setupMagento(ports);

        // Open the default browser
        await openBrowser(ports);
    });
};
