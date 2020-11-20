const { pathExists } = require('fs-extra');
const fs = require('fs');
const path = require('path');

const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath);

    if (!composerExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(composerPath, 'utf-8'));
};

const getInstalledMagentoVersion = async () => {
    const composerData = await getComposerData(path.join(process.cwd(), 'composer.json'));

    if (!composerData) {
        throw new Error('composer.json not found');
    }
    if (!composerData.require['magento/product-community-edition']) {
        throw new Error('No magento/product-community-edition dependency found in composer.json');
    }

    return composerData.require['magento/product-community-edition'];
};

module.exports = getInstalledMagentoVersion;
