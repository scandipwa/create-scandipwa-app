const { execAsyncSpawn } = require('./exec-async-command');
const {
    php: { phpBinPath },
    magento: { magentoBinPath },
    appPath
} = require('../config');
/**
 * Execute magento command
 * @param {String} command magento command
 * @param {Object} options
 */
const runMagentoCommand = async (command, options = {}) => execAsyncSpawn(`${phpBinPath} ${magentoBinPath} ${command}`, {
    ...options,
    cwd: appPath
});

const runMagentoCommandSafe = async (command, options) => {
    try {
        const result = await runMagentoCommand(command, options);
        return result;
    } catch (e) {
        return e;
    }
};

module.exports = {
    runMagentoCommand,
    runMagentoCommandSafe
};
