const { execAsyncSpawn } = require('./exec-async-command');
const {
    php,
    composer,
    config: { magentoDir }
} = require('../config');
/**
 * Execute composer command
 * @param {String} command composer command
 * @param {Object} options
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 */
const runComposerCommand = async (command, options = {}) => {
    const {
        throwNonZeroCode = true
    } = options;
    const { code, result } = execAsyncSpawn(`${php.binPath} ${composer.binPath} ${command}`, {
        ...options,
        cwd: magentoDir
    });

    if (throwNonZeroCode && code !== 0) {
        throw new Error(`Code: ${code}
        Response: ${result}`);
    }

    return { code, result };
};

module.exports = runComposerCommand;
