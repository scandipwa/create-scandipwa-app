const path = require('path');
const { config } = require('../config');
const setConfigFile = require('../util/set-config');

const createPortConfig = {
    title: 'Setting port config',
    task: async (ctx, subTask) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.cacheDir, 'port-config.json'),
                template: path.join(config.templateDir, 'port-config.template.json'),
                ports: ctx.ports,
                overwrite: true
            });
        } catch (e) {
            subTask.report(e);
            throw new Error('Unexpected error accrued during port config creation');
        }
    }
};

module.exports = createPortConfig;
