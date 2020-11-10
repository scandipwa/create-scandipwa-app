const pathExists = require('./path-exists');
const path = require('path');
const fs = require('fs');
const { cachePath } = require('../config');

const defaultConfig = {
    magento: {
        first_name: 'Scandiweb',
        last_name: 'Developer',
        email: 'developer@scandipwa.com',
        user: 'admin',
        password: 'scandipwa123',
        adminuri: 'admin',
        mode: 'developer'
    }
};

/**
 * Get application config from cache folder
 */
const getApplicationConfig = async () => {
    const configExists = await pathExists(path.join(cachePath, 'app-config.json'));

    if (configExists) {
        return JSON.parse(await fs.promises.readFile(path.join(cachePath, 'app-config.json'), 'utf-8'));
    }

    return null;
};

const saveApplicationConfig = async (config) => {
    await fs.promises.writeFile(path.join(cachePath, 'app-config.json'), JSON.stringify(config, null, 2), 'utf-8');
    return true;
};

module.exports = {
    defaultConfig,
    getApplicationConfig,
    saveApplicationConfig
};
