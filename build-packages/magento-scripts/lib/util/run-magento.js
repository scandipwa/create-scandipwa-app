const { execAsyncSpawn } = require('./exec-async-command');
const { getConfigFromMagentoVersion, magento } = require('../config');
/**
 * Execute magento command
 * @param {String} command magento command
 * @param {Object} options
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 */
const runMagentoCommand = async (command, options = {}) => {
    const {
        throwNonZeroCode = true,
        magentoVersion = magento.version
    } = options;
    const {
        php,
        config: { magentoDir }
    } = getConfigFromMagentoVersion(magentoVersion);
    const { code, result } = await execAsyncSpawn(`${php.binPath} ${magento.binPath} ${command}`, {
        ...options,
        cwd: magentoDir,
        withCode: true
    });

    if (throwNonZeroCode && code !== 0) {
        throw new Error(`Code: ${code}
        Response: ${result}`);
    }

    return { code, result };
};

module.exports = runMagentoCommand;
