const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const greet = (
    name,
    pathname
) => {
    // logger.clear();
    const relativePathname = `./${pathname}`;
    logger.logN(`Success! Created ScandiPWA extension "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);
};

module.exports = greet;
