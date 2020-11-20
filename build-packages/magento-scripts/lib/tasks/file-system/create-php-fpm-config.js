const path = require('path');
const { config } = require('../../config');
const setConfigFile = require('../../util/set-config');

const createPhpFpmConfig = {
    title: 'Setting php-fpm config',
    task: async ({ ports, config: { php } }, task) => {
        try {
            await setConfigFile({
                configPathname: php.fpmConfPath,
                template: path.join(config.templateDir, 'php-fpm.template.conf'),
                ports,
                overwrite: true
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during php-fpm config creation');
        }
    }
};

module.exports = createPhpFpmConfig;
