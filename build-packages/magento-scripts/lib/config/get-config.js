/* eslint-disable no-param-reassign */
const {
    getApplicationConfig,
    defaultConfig,
    saveApplicationConfig
} = require('../util/application-config');

const getAppConfig = {
    title: 'Checking app config',
    task: async (ctx, task) => {
        const configExists = await getApplicationConfig();
        if (configExists) {
            const { magento } = configExists;
            ctx.magentoConfig = magento;
            task.skip('App config already created');
            return;
        }
        const configType = await task.prompt({
            type: 'Select',
            message: 'How do you want to create config for magento?',
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
            ctx.magentoConfig = magentoConfig;
            task.title = 'Config created!';
        } else if (configType === 'default') {
            await saveApplicationConfig(defaultConfig);
            const { magento } = defaultConfig;
            ctx.magentoConfig = magento;
            task.title = 'Using default config!';
        } else {
            throw new Error('User have chosen to create config later.');
        }
    }
};

module.exports = getAppConfig;
