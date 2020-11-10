const fs = require('fs');

const pathExists = async (pathname) => {
    try {
        await fs.promises.access(pathname, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

module.exports = pathExists;
