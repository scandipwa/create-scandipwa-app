const path = require('path');
const { config, php } = require('../config');
const setConfigFile = require('../util/set-config');

const createPhpConfig = {
    title: 'Setting PHP config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: path.join(config.templateDir, 'php.template.ini'),
                overwrite: true
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during php.ini config creation');
        }
    }
};

module.exports = createPhpConfig;
