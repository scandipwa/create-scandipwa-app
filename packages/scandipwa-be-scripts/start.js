const exitHook = require('async-exit-hook');
const prepareFileSystem = require('./lib/steps/prepare-fs');
const prepareOS = require('./lib/steps/prepare-os');
const { startServices, stopServices } = require('./lib/steps/manage-docker-services');
const { getAvailablePorts } = require('./lib/util/get-ports');
const { startPhpFpm, stopPhpFpm } = require('./lib/steps/manage-php-fpm');
const openBrowser = require('./lib/util/open-browser');

let started = false;
const start = async () => {
    // make sure deps are installed
    await prepareOS();

    const ports = await getAvailablePorts();

    // make sure cache folder with configs is present
    await prepareFileSystem(ports);

    await startPhpFpm();

    // startup docker services
    await startServices(ports);

    started = true;

    await openBrowser(`http://localhost:${ports.app}`);
    // startup app
    // await deployMagento()
};

exitHook(async (callback) => {
    if (started) {
        callback();
        return;
    }
    await stopServices();
    await stopPhpFpm();
    callback();
});

module.exports = start;
