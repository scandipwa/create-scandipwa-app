const prepareFileSystem = require('./lib/steps/prepare-fs');
const portCheck = require('./lib/steps/port-check');
const validateOS = require('./lib/steps/validateOS');
const installPHP = require('./lib/steps/install-php');
// const run = require('./lib/steps/run');

async function main() {
    const ports = await portCheck();

    // make sur edeps are installed
    await validateOS();
    await installPHP();

    // create cache folder if not exist
    // TODO: create certificates and cache folders
    await prepareFileSystem(ports);

    // await phpInstall;
    // await run(ports);
}

main().then().catch();
