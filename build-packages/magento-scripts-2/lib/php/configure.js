const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const config = require('../config');

const configure = async () => {
    const loadedModules = await execCommandAsync(`${ config.php.binPath } -m`);
    const missingExtensions = config.php.extensions.filter(({ name }) => !loadedModules.includes(name));

    if (missingExtensions.length <= 0) {
        // if all extensions are installed - do not configure PHP
        return;
    }

    try {
        // TODO: check if this works?
        await Promise.all(missingExtensions.map(({ name, options }) => (
            execCommandAsync(
                `source ~/.phpbrew/bashrc && \
                    phpbrew use ${ config.php.version } && \
                    phpbrew ext install ${ name }${ options ? ` -- ${ options }` : ''}`,
            )
        )));
    } catch (e) {
        logger.logN(e);
        logger.error('Something went wrong during the extension installation.');
        // TODO: add more detailed logs
    }
};

module.exports = configure;
