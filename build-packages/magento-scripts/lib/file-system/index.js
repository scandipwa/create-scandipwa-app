const path = require('path');
const { php, config } = require('../config');
const setConfigFile = require('../util/set-config');

exports.createPortConfig = {
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
exports.createNginxConfig = {
    title: 'Setting nginx config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.cacheDir, 'nginx', 'conf.d', 'default.conf'),
                dirName: path.join(config.cacheDir, 'nginx', 'conf.d'),
                template: path.join(config.templateDir, 'nginx.template.conf'),
                ports: ctx.ports,
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
exports.createPhpFpmConfig = {
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

exports.createPhpConfig = {
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
