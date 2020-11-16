const commandExists = require('command-exists');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const command = async (command, suggest = () => {}) => {
    try {
        await commandExists(command);
    } catch (e) {
        logger.error(
            `The command ${ logger.style.command(command) } is not installed on your machine.`
        );

        suggest();

        process.exit();
    }
};

module.exports = command;
