/* eslint-disable no-param-reassign */
const { checkCacheFolder, createCacheFolder } = require('./lib/steps/prepare-fs');
// const prepareOS = require('./lib/steps/prepare-os');
// const { startServices } = require('./lib/steps/manage-docker-services');
const { getAvailablePorts } = require('./lib/util/get-ports');
const { startPhpFpm } = require('./lib/steps/manage-php-fpm');
const { deployDockerContainers, deployDockerNetwork, deployDockerVolumes } = require('./lib/steps/manage-docker-services');
// const openBrowser = require('./lib/util/open-browser');
// const setupMagento = require('./lib/steps/setup-magento');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const path = require('path');
const { Listr } = require('listr2');
const macosVersion = require('macos-version');
const { checkPHP, buildPHP, setupPHPExtensions } = require('./lib/steps/install-php');
const { checkDocker, getDockerVersion } = require('./lib/steps/install-docker');
const { checkMagentoApp, installApp } = require('./lib/steps/install-magento');
const {
    checkComposerAuth, checkComposerInCache, getComposerVersion, installComposerInCache
} = require('./lib/steps/install-composer');
const {
    php: { requiredPHPVersion, phpFpmConfPath }, cachePath, templatePath, appPath
} = require('./lib/config');
const { getApplicationConfig, defaultConfig, saveApplicationConfig } = require('./lib/util/application-config');
const setConfigFile = require('./lib/util/set-config');

const start = async () => {
    const tasks = new Listr([{
        title: 'Checking cache folder',
        task: async (ctx, task) => {
            const cacheFolderOk = await checkCacheFolder();

            if (cacheFolderOk) {
                task.title = 'Cache folder created!';
                task.skip('Cache folder already created!');
            } else {
                await createCacheFolder();
                task.title = 'Cache folder is created.';
            }
        }
    }, {
        title: 'Checking os',
        task: (ctx, task) => {
            const osCheckTasks = [{
                title: 'Checking docker',
                task: async (subCtx, subTask) => {
                    const dockerOk = await checkDocker();
                    if (!dockerOk) {
                        throw new Error('Docker is not installed');
                    }

                    const dockerVersion = await getDockerVersion();

                    subTask.title = `Using docker version ${dockerVersion}`;
                }
            }, {
                title: 'Checking php',
                task: async (subCtx, subTask) => {
                    const phpOk = await checkPHP();
                    if (phpOk) {
                        subTask.title = `Using PHP version ${requiredPHPVersion}`;
                        return;
                    }

                    subTask.title = `Installing PHP v${requiredPHPVersion}`;

                    try {
                        await buildPHP({
                            output: (t) => {
                                subTask.output = t;
                            }
                        });
                    } catch (e) {
                        task.report(e);
                        throw new Error(`Error while installing PHP ${requiredPHPVersion}`);
                    }

                    subTask.title = 'Installing PHP extensions';

                    try {
                        await setupPHPExtensions({
                            output: (t) => {
                                subTask.output = t;
                            }
                        });
                        subTask.title = `Using PHP version ${requiredPHPVersion}`;
                    } catch (e) {
                        task.report(e);
                        throw new Error('Error while installing PHP extensions');
                    }
                }
            }, {
                title: 'Checking composer',
                task: async (subCtx, subTask) => {
                    const isComposerAuthOk = await checkComposerAuth();

                    if (!isComposerAuthOk) {
                        throw new Error('COMPOSER_AUTH env variable is not found');
                    }

                    const hasComposerInCache = await checkComposerInCache();

                    if (hasComposerInCache) {
                        const composerVersion = await getComposerVersion();
                        subTask.title = `Using composer version ${composerVersion}`;
                        return;
                    }

                    subTask.title = 'Installing Composer';

                    await installComposerInCache();

                    const composerVersion = await getComposerVersion();
                    subTask.title = `Using composer version ${composerVersion}`;
                }
            }];

            if (macosVersion.isMacOS) {
                osCheckTasks.unshift({
                    title: 'Check macos version',
                    task: () => {
                        const minimumVersion = '10.5';
                        if (macosVersion.assertGreaterThanOrEqualTo(minimumVersion)) {
                            // check if the version is above 10.5
                            logger.error(
                                'Please update your system!',
                                `MacOS bellow version ${ logger.style.misc(minimumVersion) } is not supported.`
                            );

                            throw new Error('Unsupported macos version');
                        }
                    }
                });
            }

            return task.newListr(osCheckTasks, {
                concurrent: false,
                exitOnError: true
            });
        }
    },
    {
        title: 'Checking app config',
        task: async (ctx, task) => {
            const configExists = await getApplicationConfig();
            if (configExists) {
                task.skip('App config already created');
                return;
            }
            const configType = await task.prompt({
                type: 'Select',
                message: 'How do you want to create config for magento?',
                name: 'configType',
                choices: [
                    {
                        message: 'Use default values (recommended)',
                        name: 'default'
                    },
                    {
                        message: 'Let me choose custom options.',
                        name: 'custom'
                    },
                    {
                        message: 'I\'ll create config later myself.',
                        name: 'cancel'
                    }
                ]
            });

            if (configType === 'custom') {
                const magentoConfig = await task.prompt([
                    {
                        type: 'Input',
                        name: 'first_name',
                        message: 'Magento first name',
                        default: defaultConfig.magento.first_name
                    },
                    {
                        type: 'Input',
                        name: 'last_name',
                        message: 'Magento last name',
                        default: defaultConfig.magento.last_name
                    },
                    {
                        type: 'Input',
                        name: 'email',
                        message: 'Magento email',
                        default: defaultConfig.magento.email
                    },
                    {
                        type: 'Input',
                        name: 'user',
                        message: 'Magento admin user',
                        default: defaultConfig.magento.user
                    },
                    {
                        type: 'Input',
                        name: 'password',
                        message: 'Magento admin password',
                        default: defaultConfig.magento.password
                    },
                    {
                        type: 'Input',
                        name: 'adminuri',
                        message: 'Magento admin panel url path',
                        default: defaultConfig.magento.adminuri
                    },
                    {
                        type: 'Select',
                        name: 'mode',
                        message: 'Magento mode',
                        choices: [
                            'developer',
                            'production'
                        ],
                        default: defaultConfig.magento.mode
                    }
                ]);

                await saveApplicationConfig({
                    magento: magentoConfig
                });
                task.title = 'Config created!';
            } else if (configType === 'default') {
                await saveApplicationConfig(defaultConfig);
                task.title = 'Using default config!';
            } else {
                throw new Error('User have chosen to create config later.');
            }
        }
    }, {
        title: 'Get available ports',
        task: async (ctx) => {
            ctx.ports = await getAvailablePorts();
        }
    }, {
        title: 'Preparing file system',
        task: async (ctx, task) => task.newListr([
            {
                title: 'Setting port config',
                task: async (subCtx, subTask) => {
                    try {
                        await setConfigFile({
                            configPathname: path.join(cachePath, 'port-config.json'),
                            template: path.join(templatePath, 'port-config.template.json'),
                            name: 'port config',
                            ports: ctx.ports,
                            overwrite: true
                        });
                    } catch (e) {
                        subTask.report(e);
                        throw new Error('Unexpected error accrued during port config creation');
                    }
                }
            },
            {
                title: 'Setting nginx config',
                task: async (subCtx, subTask) => {
                    try {
                        await setConfigFile({
                            configPathname: path.join(cachePath, 'nginx', 'conf.d', 'default.conf'),
                            dirName: path.join(cachePath, 'nginx', 'conf.d'),
                            template: path.join(templatePath, 'nginx.template.conf'),
                            name: 'Nginx',
                            ports: ctx.ports,
                            overwrite: true,
                            templateArgs: {
                                mageRoot: appPath
                            }
                        });
                    } catch (e) {
                        subTask.report(e);
                        throw new Error('Unexpected error accrued during nginx config creation');
                    }
                }
            },
            {
                title: 'Setting php-fpm config',
                task: async (subCtx, subTask) => {
                    try {
                        await setConfigFile({
                            configPathname: phpFpmConfPath,
                            template: path.join(templatePath, 'php-fpm.template.conf'),
                            name: 'php-fpm',
                            ports: ctx.ports,
                            overwrite: true
                        });
                    } catch (e) {
                        subTask.report(e);
                        throw new Error('Unexpected error accrued during php-fpm config creation');
                    }
                }
            }
        ], {
            concurrent: true,
            rendererOptions: {
                collapse: true
            },
            exitOnError: true
        })
    }, {
        title: 'Installing magento app',
        task: async (ctx, task) => {
            const hasMagentoApp = await checkMagentoApp();

            if (hasMagentoApp) {
                task.skip('Magento installed!');
                return;
            }

            await installApp({
                output: (t) => {
                    task.output = t;
                }
            });
        },
        options: {
            bottomBar: 10
        }
    }, {
        title: 'Start PHP-FPM',
        task: async (ctx, task) => {
            try {
                await startPhpFpm({
                    output: (t) => {
                        task.output = t;
                    }
                });
            } catch (e) {
                task.report(e);
                throw new Error('Error during php-fpm start');
            }
        },
        options: {
            bottomBar: 5
        }
    }, {
        title: 'Start docker services',
        task: async (ctx, task) => task.newListr([
            {
                title: 'Deploy docker network',
                task: async () => {
                    const networkDeployed = await deployDockerNetwork();

                    if (!networkDeployed) {
                        throw new Error('Deploy network error');
                    }
                }
            },
            {
                title: 'Deploy docker volumes',
                task: async () => {
                    const volumesDeployed = await deployDockerVolumes();

                    if (!volumesDeployed) {
                        throw new Error('Deploy volumes error');
                    }
                }
            },
            {
                title: 'Deploy docker containers',
                task: async () => {
                    const containersDeployed = await deployDockerContainers({ ports: ctx.ports });

                    if (!containersDeployed) {
                        throw new Error('Deploy containers error');
                    }
                }
            }
        ], {
            concurrent: false,
            exitOnError: true
        })
    }], {
        concurrent: false,
        exitOnError: true,
        ctx: {},
        rendererOptions: { collapse: false }
    });

    await tasks.run();

    return true;
    // // make sure deps are installed
    // await prepareOS();

    // const ports = await getAvailablePorts();

    // // make sure cache folder with configs is present
    // await prepareFileSystem(ports);

    // await startPhpFpm();

    // // startup docker services
    // await startServices(ports);

    // await setupMagento();

    // openBrowser(`http://localhost:${ports.app}`);

    // logger.log(`Application started up on http://localhost:${ports.app}`, 1);

    // return true;
};

module.exports = start;
