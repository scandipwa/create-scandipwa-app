const eta = require('eta');
const fs = require('fs');
const { pathExists } = require('fs-extra');

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
        const dirExists = await pathExists(dirName);
        if (!dirExists) {
            await fs.promises.mkdir(dirName, { recursive: true });
        }
    }
    await fs.promises.writeFile(configPathname, compliedConfig, { encoding: 'utf-8' });

    return true;
};

module.exports = setConfigFile;
