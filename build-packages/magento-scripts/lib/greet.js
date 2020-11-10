const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const greet = (
    name,
    pathname
) => {
    const relativePathname = `./${pathname}`;
    logger.logN(`Success! Created Magento 2 application "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);
};

module.exports = greet;
