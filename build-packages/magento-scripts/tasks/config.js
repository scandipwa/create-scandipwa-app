const path = require('path');
const {
    php: { phpIniPath, phpFpmConfPath }, cachePath, templatePath, appPath
} = require('../lib/config');
const setConfigFile = require('../lib/util/set-config');

exports.setPortConfigTask = {
    title: 'Setting port config',
    task: async (ctx, subTask) => {
        try {
            await setConfigFile({
                configPathname: path.join(cachePath, 'port-config.json'),
                template: path.join(templatePath, 'port-config.template.json'),
                ports: ctx.ports,
                overwrite: true
            });
        } catch (e) {
            subTask.report(e);
            throw new Error('Unexpected error accrued during port config creation');
        }
    }
};
exports.setNginxConfigTask = {
    title: 'Setting nginx config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: path.join(cachePath, 'nginx', 'conf.d', 'default.conf'),
                dirName: path.join(cachePath, 'nginx', 'conf.d'),
                template: path.join(templatePath, 'nginx.template.conf'),
                ports: ctx.ports,
                overwrite: true,
                templateArgs: {
                    mageRoot: appPath
                }
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during nginx config creation');
        }
    }
};
exports.setPhpFpmConfigTask = {
    title: 'Setting php-fpm config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: phpFpmConfPath,
                template: path.join(templatePath, 'php-fpm.template.conf'),
                ports: ctx.ports,
                overwrite: true
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during php-fpm config creation');
        }
    }
};

exports.setPhpConfigTask = {
    title: 'Setting PHP config',
    task: async (ctx, task) => {
        try {
            await setConfigFile({
                configPathname: phpIniPath,
                template: path.join(templatePath, 'php.template.ini'),
                overwrite: true
            });
        } catch (e) {
            task.report(e);
            throw new Error('Unexpected error accrued during php.ini config creation');
        }
    }
};
