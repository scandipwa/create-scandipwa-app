const fs = require('fs');
const { pidFilePath } = require('../config');
const pathExists = require('./path-exists');

const getProcessId = async () => {
    const pidExists = await pathExists(pidFilePath);

    if (pidExists) {
        return fs.promises.readFile(pidFilePath, 'utf-8');
    }

    return null;
};

module.exports = getProcessId;
