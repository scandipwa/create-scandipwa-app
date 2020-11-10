const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');

const greet = (
    name,
    pathname
) => {
    const relativePathname = `./${pathname}`;
    const displayedCommand = shouldUseYarn() ? 'yarn' : 'npm run';

    logger.logN(`Success! Created Magento 2 application "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);

    logger.log('Inside that directory, you can run several commands:');
    logger.logT(
        logger.style.command(`${displayedCommand} start`),
        logger.style.comment('Starts the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} stop`),
        logger.style.comment('Stops the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} restart`),
        logger.style.comment('Restart the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} cleanup`),
        logger.style.comment('Removes the Magento 2 installation')
    );

    logger.log(); // add empty line

    logger.log('We suggest that you begin by typing:');
    logger.logT(logger.style.command('cd'), relativePathname);
    logger.logT(logger.style.command(`${displayedCommand} start`));

    logger.log(); // add empty line

    logger.logN('Happy coding! <3');
};

module.exports = greet;
