const ora = require('ora');
const { stopPhpFpm } = require('./lib/steps/manage-php-fpm');
const { stopServices } = require('./lib/steps/manage-docker-services');

const stop = async () => {
    const output = ora();

    const stopPhpFpmOk = await stopPhpFpm({ output });

    if (!stopPhpFpmOk) {
        return false;
    }

    await stopServices({ output });

    return true;
};

module.exports = stop;
