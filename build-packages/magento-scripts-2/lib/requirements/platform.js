const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const platform = (supportedPlatforms, suggest = () => {}) => {
    const currentPlatform = os.platform();

    if (!supportedPlatforms.includes(os.platform())) {
        logger.error(
            `Your current OS platform is ${ logger.style.misc(currentPlatform) }.`,
            `Unfortunately, currently we only support ${ currentPlatform.map((platform) => logger.style.misc(platform).join(',')) }.`
        );

        suggest();

        process.exit();
    }
};

module.exports = platform;
