const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createDirSafe = require('./create-dir-safe');
const pathExists = require('./path-exists');
const eta = require('eta');
const fs = require('fs');

const checkConfigPath = async ({
    configPathname,
    dirName,
    template,
    ports = {},
    name,
    overwrite,
    templateArgs = {}
}) => {
    const pathOk = await pathExists(configPathname);

    if (pathOk && !overwrite) {
        if (overwrite) {
            logger.log(`${name} config already created`);
        }

        return true;
    }

    if (overwrite) {
        logger.log(`Recreating ${name} config...`);
    } else {
        logger.warn(`${name} config not found, creating...`);
    }
    const configTemplate = await fs.promises.readFile(template, 'utf-8');

    const compliedConfig = await eta.render(configTemplate, { ports, date: new Date().toUTCString(), ...templateArgs });

    try {
        if (dirName) {
            await createDirSafe(dirName);
        }
        await fs.promises.writeFile(configPathname, compliedConfig, { encoding: 'utf-8' });
        logger.log(`${name} config created`);

        return true;
    } catch (e) {
        logger.error(`create ${name} config error`);

        logger.log(e);

        logger.error(`Failed to create ${name} configuration file. See ERROR log above`);
        return false;
    }
};

module.exports = checkConfigPath;
