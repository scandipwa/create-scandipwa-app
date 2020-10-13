const prepareFileSystem = require('./lib/steps/prepare-fs');
const getPorts = require('./lib/steps/get-ports');
const prepareOS = require('./lib/steps/prepare-os');
const installPHP = require('./lib/steps/install-php');
const deployServices = require('./lib/steps/deploy-services');
// const run = require('./lib/steps/run');

async function main() {
    // make sure deps are installed
    await prepareOS();
    await prepareFileSystem();

    const ports = await getPorts();

    // create cache folder if not exist
    // TODO: create certificates and cache folders

    await deployServices(ports)

    await installPHP();

    // await phpInstall;
    // await run(ports);
}

main()
