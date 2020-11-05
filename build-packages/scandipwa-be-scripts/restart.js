const start = require('./start');
const stop = require('./stop');

const restart = async () => {
    await stop();

    await start();
};

module.exports = restart;
