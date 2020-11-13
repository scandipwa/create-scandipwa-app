/* eslint-disable no-param-reassign */
const { getAvailablePorts } = require('./lib/util/get-ports');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const macosVersion = require('macos-version');
const { getApplicationConfig, defaultConfig, saveApplicationConfig } = require('./lib/util/application-config');
const openBrowser = require('./lib/util/open-browser');
const { startPhpFpmTask } = require('./tasks/php-fpm');
const {
    deployDockerNetworkTask,
    deployDockerVolumesTask,
    deployDockerContainersTask,
    checkDockerInstallTask
} = require('./tasks/docker');
const { installPhp } = require('./tasks/php');
const { checkComposerTask } = require('./tasks/composer');
const {
    setPortConfigTask,
    setNginxConfigTask,
    setPhpFpmConfigTask,
    setPhpConfigTask
} = require('./tasks/config');
const {
    installMagentoTask,
    setupMagentoTask
} = require('./tasks/magento');
const { createCacheFolderTask } = require('./tasks/cache');

const start = async () => {
    const tasks = new Listr([
        {
            title: 'Choose Magento Version',
            task: async (ctx, task) => {
                ctx.magentoVersion = await task.prompt({
                    type: 'Select',
                    message: 'Choose Magento Version',
                    choices: [
                        {
                            name: '2.4.0',
                            message: '2.4.0'
                        },
                        {
                            name: '2.4.1',
                            message: '2.4.1'
                        }
                    ]
                });
            }
        },
        createCacheFolderTask,
        {
            title: 'Checking os',
            task: (ctx, task) => {
                const osCheckTasks = [
                    checkDockerInstallTask,
                    installPhp,
                    checkComposerTask
                ];

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
        },
        {
            title: 'Preparing file system',
            task: async (ctx, task) => task.newListr([
                setPortConfigTask,
                setNginxConfigTask,
                setPhpFpmConfigTask,
                setPhpConfigTask
            ], {
                concurrent: true,
                rendererOptions: {
                    collapse: false
                },
                exitOnError: true,
                ctx
            })
        },
        installMagentoTask,
        startPhpFpmTask,
        {
            title: 'Start docker services',
            task: async (ctx, task) => task.newListr([
                deployDockerNetworkTask,
                deployDockerVolumesTask,
                deployDockerContainersTask
            ], {
                concurrent: false,
                exitOnError: true,
                rendererOptions: {
                    collapse: false
                },
                ctx
            })
        },
        setupMagentoTask,
        {
            title: 'Open browser',
            task: async (ctx) => {
                openBrowser(`http://localhost:${ctx.ports.app}`);
            }
        }], {
        concurrent: false,
        exitOnError: true,
        ctx: {},
        rendererOptions: { collapse: false }
    });

    await tasks.run();
};

module.exports = start;
