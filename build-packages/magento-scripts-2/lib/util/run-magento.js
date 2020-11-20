const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const config = require('../config');

// run Magento 2 CLI command
const runMagentoCommand = async (command, isReturnLogs = false) => execCommandAsync(
    `${ config.php.binPath } ${ config.magento.binPath } ${ command }`,
    process.cwd(),
    isReturnLogs
);

module.exports = runMagentoCommand;
