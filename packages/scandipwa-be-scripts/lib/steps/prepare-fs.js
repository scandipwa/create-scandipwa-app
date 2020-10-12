const path = require('path');
const { execAsync } = require('../util/exec-async');

async function prepareFileSystem() {
    // Copy template files
    const cacheFolder = path.join(process.cwd(), 'node_modules', '.cache');
    await execAsync(`mkdir -p ${ cacheFolder }`);
}

module.exports = prepareFileSystem;
