const inquirer = require('inquirer');
const ora = require('ora');
const { getApplicationConfig, defaultConfig, saveApplicationConfig } = require('../util/application-config');

const createApplicationConfig = async ({ output }) => {
    output = output || ora();
    const currentConfig = await getApplicationConfig();

    if (!currentConfig) {
        output.warn('Application config no found, we need to create one.');
        const { config_type } = await inquirer.prompt([
            {
                type: 'list',
                name: 'config_type',
                message: 'How do you want to create config for magento?',
                choices: [
                    {
                        name: 'Use default values (recommended)',
                        value: 'default'
                    },
                    {
                        name: 'Let me choose custom options.',
                        value: 'custom'
                    },
                    {
                        name: 'I\'ll create config later myself.',
                        value: 'cancel'
                    }
                ]
            }
        ]);

        if (config_type === 'custom') {
            const magentoConfig = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'Magento first name',
                    default: defaultConfig.magento.first_name
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Magento last name',
                    default: defaultConfig.magento.last_name
                },
                {
                    type: 'input',
                    name: 'email',
                    message: 'Magento email',
                    default: defaultConfig.magento.email
                },
                {
                    type: 'input',
                    name: 'user',
                    message: 'Magento admin user',
                    default: defaultConfig.magento.user
                },
                {
                    type: 'input',
                    name: 'password',
                    message: 'Magento admin password',
                    default: defaultConfig.magento.password
                },
                {
                    type: 'input',
                    name: 'adminuri',
                    message: 'Magento admin panel url path',
                    default: defaultConfig.magento.adminuri
                },
                {
                    type: 'list',
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
        } else if (config_type === 'default') {
            await saveApplicationConfig(defaultConfig);
        } else {
            output.warn('Ok, good luck');
            return false;
        }

        output.succeed('Config created!');
        return true;
    }

    return true;
};

module.exports = createApplicationConfig;
