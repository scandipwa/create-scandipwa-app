const prepareFileSystem = require('./lib/steps/prepare-fs');
const prepareOS = require('./lib/steps/prepare-os');
const { startServices } = require('./lib/steps/manage-docker-services');
const { getAvailablePorts } = require('./lib/util/get-ports');
const { startPhpFpm } = require('./lib/steps/manage-php-fpm');
const openBrowser = require('./lib/util/open-browser');
const setupMagento = require('./lib/steps/setup-magento');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const start = async () => {
    // make sure deps are installed
    await prepareOS();

    const ports = await getAvailablePorts();

    // make sure cache folder with configs is present
    await prepareFileSystem(ports);

    await startPhpFpm();

    // startup docker services
    await startServices(ports);

    await setupMagento();

    openBrowser(`http://localhost:${ports.app}`);

    logger.log(`Application started up on http://localhost:${ports.app}`, 1);

    return true;
};

module.exports = start;
