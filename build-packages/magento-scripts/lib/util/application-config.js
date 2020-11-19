const path = require('path');
const fs = require('fs');
const { config } = require('../config');
const { pathExists } = require('fs-extra');

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
    const configExists = await pathExists(path.join(config.cacheDir, 'app-config.json'));

    if (configExists) {
        return JSON.parse(await fs.promises.readFile(path.join(config.cacheDir, 'app-config.json'), 'utf-8'));
    }

    return null;
};

const saveApplicationConfig = async (appConfig) => {
    await fs.promises.writeFile(
        path.join(config.cacheDir, 'app-config.json'),
        JSON.stringify(appConfig, null, 2),
        'utf-8'
    );

    return true;
};

module.exports = {
    defaultConfig,
    getApplicationConfig,
    saveApplicationConfig
};
