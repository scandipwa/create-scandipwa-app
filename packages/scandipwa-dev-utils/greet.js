const logger = require('./logger');
const clearConsole = require('react-dev-utils/clearConsole');
const path = require('path');
const fs = require('fs');

const greet = ({ name, path: pathname }) => {
    clearConsole();

    const relativePathname = `./${pathname}`;
    // const isYarn = fs.existsSync(path.join(pathname, 'yarn.lock'));
    const isYarn = true;
    const displayedCommand = isYarn ? 'yarn' : 'npm run';

    logger.logN(`Success! Created ScandiPWA theme "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);

    logger.log('Inside that directory, you can run several commands:');
    logger.logT(
        logger.style.command(`${displayedCommand} start`),
        logger.style.comment('Starts the development server')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} build`),
        logger.style.comment('Bundles the app into static files for production')
    );

    logger.note(
        'To bundle your application as valid Magento 2 theme',
        `use ${ logger.style.command(`${displayedCommand} build --magento`) } command!`,
        `You Magento 2 theme name is "${ logger.style.misc(`scandipwa/${ name }`) }"`
    );

    logger.log('We suggest that you begin by typing:');
    logger.logT(logger.style.command('cd'), relativePathname);
    logger.logT(logger.style.command(`${displayedCommand} start`));

    logger.log(); // add empty line
    logger.logN('Happy coding! <3');
};

module.exports = greet;