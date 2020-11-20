const path = require('path');
const { config } = require('../../config');
const setConfigFile = require('../../util/set-config');

const createNginxConfig = {
    title: 'Setting nginx config',
    task: async ({ ports }, task) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.cacheDir, 'nginx', 'conf.d', 'default.conf'),
                dirName: path.join(config.cacheDir, 'nginx', 'conf.d'),
                template: path.join(config.templateDir, 'nginx.template.conf'),
                ports,
                overwrite: true,
                templateArgs: {
                    mageRoot: config.magentoDir
                }
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during nginx config creation');
        }
    }
};

module.exports = createNginxConfig;
