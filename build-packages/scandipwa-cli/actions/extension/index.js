const { createExtension, installExtension } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

module.exports = (yargs) => {
    yargs.command('extension <command>', 'Interact with extension', (yargs) => {
        yargs.command('install <name>', 'Install and enable ScandiPWA extension', (yargs) => {
            yargs.option('no-enable', {
                describe: 'Do not enable installed extension.'
            });
        }, async ({ name, noEnable }) => {
            const installedSuccessfully = await installExtension(name, !noEnable);

            if (!installedSuccessfully) {
                return;
            }

            logger.note(
                `Package ${logger.style.misc(name)} has been installed successfully!`
            );
        });

        /* yargs.command('search <query>', 'Search for available extension.', () => {}, (argv) => {
            // TODO: implement search extension
            console.log('srch', argv);
        }); */

        yargs.command('create <name>', 'Create and enable new ScandiPWA extension', (yargs) => {
            yargs.option('no-enable', {
                describe: 'Do not enable installed extension.',
                default: false
            });
        }, async ({ name, noEnable }) => {
            const createdPackage = await createExtension(name, !noEnable, logger);

            if (!createdPackage) {
                return;
            }

            logger.note(
                `Package ${logger.style.misc(name)} has been created successfully!`,
                `See it at ${logger.style.file(createdPackage)}`
            );
        });

        yargs.demandCommand();
    });
};
