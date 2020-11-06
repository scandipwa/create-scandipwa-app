const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const path = require('path');
// const { isValidComposer } = require('@scandipwa/scandipwa-dev-utils/composer');

module.exports = () => {
    logger.note(
        'Building as a Magento theme!',
        `The ${ logger.style.file('public/index.html') } file content will not be taken into account!`,
        `Using content of ${ logger.style.file('public/index.php') } instead!`
    );

    /**
     * TODO fix composer deps version
     */
    // if (!isValidComposer()) {
    //     process.exit();
    // }
    process.env.WDS_SOCKET_PORT = 3000;
    process.env.PWA_BUILD_MODE = 'magento';
    const { name: themeName } = require(path.join(process.cwd(), 'composer.json'));
    process.env.PUBLIC_URL = `/static/version${ Date.now() }/frontend/${ themeName }/${ process.env.PWA_LOCALE || 'en_US' }/Magento_Theme/`;
};
