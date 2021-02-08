const path = require('path');

const { locateScandipwaModule } = require('@scandipwa/scandipwa-development-toolkit-core');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const BUBBLE_DEPTH = 5;

const invokeGenerator = async (
    targetModule = locateScandipwaModule(process.cwd(), BUBBLE_DEPTH),
    fileGenerator
) => {
    // Handle no target module
    if (!targetModule) {
        logger.error(
            `Unable to locate a ScandiPWA module ${logger.style.misc(BUBBLE_DEPTH)} directories up from`,
            logger.style.file(process.cwd()),
            'Please make sure the command is ran in a ScandiPWA module',
            `Or supply a path to a ScandiPWA module by using ${logger.style.command('--target-module [-t]')} flag`
        );

        return;
    }

    // Invoke the callback to generate files
    const createdFiles = await fileGenerator(targetModule);

    // Handle no files generated
    if (!createdFiles.length) {
        logger.note('No files have been generated.');

        return;
    }

    // Output paths to the created files
    logger.note(
        'The following files have been created:',
        ...createdFiles.map(
            (filepath) => logger.style.file(path.relative(process.cwd(), filepath))
        )
    );
};

module.exports = invokeGenerator;
