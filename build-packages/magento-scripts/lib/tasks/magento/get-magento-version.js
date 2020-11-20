/* eslint-disable no-param-reassign */
const { allVersions } = require('../../config/version-config');
const { getConfigFromMagentoVersion } = require('../../config');
const getInstalledMagentoVersion = require('../../util/get-installed-magento-version');

const getMagentoVersion = {
    title: 'Getting magento version',
    task: async (ctx, task) => {
        let magentoVersion;

        try {
            magentoVersion = await getInstalledMagentoVersion();
        } catch (e) {
            if (ctx.throwMagentoVersionMissing) {
                throw e;
            }
            magentoVersion = await task.prompt({
                type: 'Select',
                message: 'Choose Magento Version',
                name: 'magentoVersion',
                choices: allVersions.map((version) => (
                    {
                        name: version,
                        message: version
                    }
                ))
            });
        }

        ctx.magentoVersion = magentoVersion;
        ctx.config = getConfigFromMagentoVersion(magentoVersion);
        task.title = `Using Magento ${magentoVersion}`;
    }
};

module.exports = getMagentoVersion;
