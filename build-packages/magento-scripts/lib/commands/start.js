/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const {
    getApplicationConfig,
    defaultConfig,
    saveApplicationConfig
} = require('../util/application-config');
const { getAvailablePorts } = require('../util/ports');
const openBrowser = require('../util/open-browser');

const { installComposer } = require('../composer');
const { startServices } = require('../docker');
const { installPhp } = require('../php');
const { checkRequirements } = require('../requirements');
const { createCacheFolder } = require('../cache');
const { startPhpFpm } = require('../php-fpm');
const { prepareFileSystem } = require('../file-system');
const { installMagento, setupMagento } = require('../magento');

module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        // yargs.option(
        //     'detached',
        //     {
        //         alias: 'd',
        //         describe: 'Run application in detached mode.',
        //         type: 'boolean',
        //         default: false
        //     }
        // );

        yargs.option(
            'restart',
            {
                alias: 'r',
                describe: 'Restart deployed application.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        );
    }, async (args = {}) => {
        const tasks = new Listr([
            createCacheFolder,
            checkRequirements,
            getAvailablePorts,
            installComposer,
            installPhp,
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
            },
            {
                title: 'Choose Magento Version',
                task: async (ctx, task) => {
                    const { magentoVersion } = await task.prompt({
                        type: 'Select',
                        message: 'Choose Magento Version',
                        name: 'magentoVersion',
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

                    ctx.magentoVersion = magentoVersion;
                    task.title = `Using Magento ${magentoVersion}`;
                }
            },
            prepareFileSystem,
            installMagento,
            startPhpFpm,
            startServices,
            setupMagento,
            {
                title: 'Open browser',
                task: async (ctx) => {
                    openBrowser(`http://localhost:${ctx.ports.app}`);
                }
            }
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: { ...args },
            rendererOptions: { collapse: false }
        });

        try {
            await tasks.run();
        } catch (e) {
            tasks.err.forEach((error) => {
                logger.error(error);
            });
        }
    });
};
