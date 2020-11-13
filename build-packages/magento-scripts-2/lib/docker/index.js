const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { stop: stopContainers, start: startContainers } = require('./containers');
const { stop: stopNetwork, start: startNetwork } = require('./network');
const { /* stop: stopVolumes, */ start: startVolumes } = require('./volumes');

const start = async (ports) => {
    try {
        await startNetwork();
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Failed to start docker network, can not proceed.',
            'Please see the error above.'
        );

        logger.note(
            'We would appreciate an issue on GitHub :)'
        );

        process.exit();
    }

    try {
        await startVolumes();
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Failed to create docker volumes, can not proceed.',
            'Please see the error above.'
        );

        logger.note(
            'We would appreciate an issue on GitHub :)'
        );

        process.exit();
    }

    try {
        await startContainers(ports);
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Failed to start docker containers, can not proceed.',
            'Please see the error above.'
        );

        logger.note(
            'We would appreciate an issue on GitHub :)'
        );

        process.exit();
    }
};

const stop = async () => {
    await stopNetwork();
    await stopContainers();
    // await stopVolumes();
};

module.exports = {
    start,
    stop
};
