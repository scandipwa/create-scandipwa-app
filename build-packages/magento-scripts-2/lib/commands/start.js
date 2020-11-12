const checkRequirements = require('../requirements');
const buildPhp = require('../php/build');
const installComposer = require('../composer/install');
const { getPorts } = require('../util/ports');

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

        // Start docker containers based on ports we just obtained
        await startDockerContainers(ports);
    });
};
