const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const path = require('path');
const fs = require('fs');

const greet = (
    name,
    pathname
) => {
    logger.clear();

    const relativePathname = `./${pathname}`;
    const isYarn = fs.existsSync(path.join(pathname, 'yarn.lock'));
    // const displayedCommand = isYarn ? 'yarn' : 'npm run';

    logger.logN(`Success! Created ScandiPWA extension "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);

    // TODO: add extension installation instruction

    logger.log(); // add empty line
    logger.logN('Happy coding! <3');
};

module.exports = greet;