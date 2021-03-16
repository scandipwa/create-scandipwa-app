const logger = require('./logger');

const makeAnAnnouncement = () => {
    const eventDate = Date.parse('2021-03-26');

    if (new Date() > eventDate) {
        return;
    }

    logger.log(); // add empty line

    logger.log(logger.style.comment('==================================='));
    logger.log(); // add empty line
    logger.log('Hey friend! A small announcement:');
    logger.log(); // add empty line
    logger.log(`There is a ScandiPWA Spring meetup organized on the ${ logger.style.code('26th of March!') }`);
    logger.logT('- Greet the team behind ScandiPWA!');
    logger.logT('- Meet the community propulsing ScandiPWA forward!');
    logger.logT('- Learn how ScandiPWA impacts business – directly from business owners!');
    logger.log(); // add empty line
    logger.log('Register for free:', logger.style.link('https://hopin.com/events/scandipwa-spring-meetup-2021'));
    logger.log(); // add empty line
    logger.log(logger.style.comment('==================================='));
};

module.exports = makeAnAnnouncement;
