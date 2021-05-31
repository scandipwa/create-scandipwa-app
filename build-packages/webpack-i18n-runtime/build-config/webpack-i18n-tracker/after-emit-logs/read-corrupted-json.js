const logger = require('@scandipwa/common-dev-utils/logger');

/**
 * Corrupted JSON load error
 * @param {string} jsonPath
 * @param {object} error
 */
module.exports = (jsonPath, error) => ({
    type: 'error',
    args: [
        `Unable to load a translation from ${jsonPath}.`,
        `Error: ${logger.style.misc(error.message)}`
    ]
});
