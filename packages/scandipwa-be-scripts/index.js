const prepareFileSystem = require('./lib/steps/prepare-fs');
const getPorts = require('./lib/steps/get-ports');
const validateOS = require('./lib/steps/validate-os');
const installPHP = require('./lib/steps/install-php');
const deployServices = require('./lib/steps/deploy-services');
// const run = require('./lib/steps/run');

async function main() {
    const ports = await getPorts();

    // make sure deps are installed
    await validateOS();
    await installPHP();

    // create cache folder if not exist
    // TODO: create certificates and cache folders
    await prepareFileSystem();

    await deployServices(ports)

    // await phpInstall;
    // await run(ports);
}

main()
