const { execAsyncSpawn } = require('./exec-async-command');
const {
    php: { phpBinPath },
    composer: { composerBinPath },
    appPath
} = require('../config');
/**
 * Execute composer command
 * @param {String} command composer command
 * @param {Object} options
 */
const runComposerCommand = async (command, options = {}) => execAsyncSpawn(`${phpBinPath} ${composerBinPath} ${command}`, {
    ...options,
    cwd: appPath
});

const runComposerCommandSafe = async (command, options) => {
    try {
        const result = await runComposerCommand(command, options);
        return result;
    } catch (e) {
        return e;
    }
};

module.exports = {
    runComposerCommand,
    runComposerCommandSafe
};
