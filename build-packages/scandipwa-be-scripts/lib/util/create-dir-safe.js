/* eslint-disable no-empty */
const fs = require('fs');

/**
 * Call mkdir safely
 * @param {String} dir dir path
 */
const createDirSafe = async (dir) => {
    try {
        await fs.promises.mkdir(dir, { recursive: true });
    } catch {}
};

module.exports = createDirSafe;
