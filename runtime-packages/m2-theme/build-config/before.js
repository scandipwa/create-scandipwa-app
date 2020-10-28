const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { isValidComposer } = require('@scandipwa/scandipwa-dev-utils/composer');

module.exports = () => {
    logger.note(
        'Building as a Magento theme!',
        `The ${ logger.style.file('public/index.html') } file content will not be taken into account!`,
        `Using content of ${ logger.style.file('public/index.php') } instead!`
    );

    if (!isValidComposer()) {
        process.exit();
    }

    process.env.PWA_BUILD_MODE = 'magento';
};
