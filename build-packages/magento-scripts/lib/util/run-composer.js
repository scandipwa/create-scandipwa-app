const { execAsyncSpawn } = require('./exec-async-command');
const { getConfigFromMagentoVersion, magento } = require('../config');
/**
 * Execute composer command
 * @param {String} command composer command
 * @param {Object} options
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 */
const runComposerCommand = async (command, options = {}) => {
    const {
        throwNonZeroCode = true,
        magentoVersion = magento.version
    } = options;
    const {
        php,
        composer,
        config: { magentoDir }
    } = getConfigFromMagentoVersion(magentoVersion);
    const { code, result } = await execAsyncSpawn(`${php.binPath} ${composer.binPath} ${command}`, {
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

module.exports = runComposerCommand;
