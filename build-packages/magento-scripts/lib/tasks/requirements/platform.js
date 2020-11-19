const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { platforms } = require('../config');

const checkPlatform = {
    title: 'Checking platform',
    task: async () => {
        const currentPlatform = os.platform();

        if (!platforms.includes(currentPlatform)) {
            throw new Error(
                `Your current OS platform is ${ logger.style.misc(currentPlatform) }.
                Unfortunately, currently we only support ${ platforms.map((platform) => logger.style.misc(platform).join(',')) }.`
            );
        }
    }
};

module.exports = checkPlatform;
