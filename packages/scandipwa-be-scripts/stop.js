const { stopPhpFpm } = require('./lib/steps/manage-php-fpm');
const { stopServices } = require('./lib/steps/manage-docker-services');

const stop = async () => {
    const stopPhpFpmOk = await stopPhpFpm();

    if (!stopPhpFpmOk) {
        return false;
    }

    await stopServices();

    return true;
};

module.exports = stop;
