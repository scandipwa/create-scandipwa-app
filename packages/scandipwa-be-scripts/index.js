const prepareFileSystem = require('./lib/steps/prepare-fs');
const prepareOS = require('./lib/steps/prepare-os');
const deployServices = require('./lib/steps/deploy-services');
// const run = require('./lib/steps/run');

async function main() {
    // make sure deps are installed
    await prepareOS();
    await prepareFileSystem();

    await deployServices()


    // await phpInstall;
    // await run(ports);
}

main()
