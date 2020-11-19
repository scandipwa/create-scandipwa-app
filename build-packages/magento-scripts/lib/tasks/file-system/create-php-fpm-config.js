const path = require('path');
const { config, php } = require('../config');
const setConfigFile = require('../util/set-config');

const createPhpFpmConfig = {
    title: 'Setting php-fpm config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: php.fpmConfPath,
                template: path.join(config.templateDir, 'php-fpm.template.conf'),
                ports: ctx.ports,
                overwrite: true
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during php-fpm config creation');
        }
    }
};

module.exports = createPhpFpmConfig;
