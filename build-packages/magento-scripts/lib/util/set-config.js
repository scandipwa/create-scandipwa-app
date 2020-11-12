const createDirSafe = require('./create-dir-safe');
const pathExists = require('./path-exists');
const eta = require('eta');
const fs = require('fs');

const setConfigFile = async ({
    configPathname,
    dirName,
    template,
    ports = {},
    overwrite,
    templateArgs = {}
}) => {
    const pathOk = await pathExists(configPathname);

    if (pathOk && !overwrite) {
        return true;
    }

    const configTemplate = await fs.promises.readFile(template, 'utf-8');
    const compliedConfig = await eta.render(configTemplate, { ports, date: new Date().toUTCString(), ...templateArgs });

    if (dirName) {
        await createDirSafe(dirName);
    }
    await fs.promises.writeFile(configPathname, compliedConfig, { encoding: 'utf-8' });

    return true;
};

module.exports = setConfigFile;
