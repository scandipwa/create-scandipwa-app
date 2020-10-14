const fs = require('fs')

const checkCacheFolder = async () => {
    try {
        await fs.promises.access('node_modules/.create-scandipwa-app-cache', fs.constants.F_OK)
        return true
    } catch {
        await fs.promises.mkdir('node_modules/.create-scandipwa-app-cache')
        return false
    }
}



async function prepareFileSystem() {
    // Copy template files
    await checkCacheFolder()
}

module.exports = prepareFileSystem;
