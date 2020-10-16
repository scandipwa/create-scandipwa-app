const path = require('path');
const fs = require('fs');
const { cachePath } = require('../config');

const savePortsConfig = async ({ ports }) => {
    await fs.promises.writeFile(
        path.join(cachePath, 'port-config.json'),
        JSON.stringify(ports, null, 2),
        { encoding: 'utf8' }
    );
};

module.exports = savePortsConfig;
