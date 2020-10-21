/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const path = require('path');
const {
    php: { phpBinPath },
    composer: { composerBinPath }
} = require('../config');
const { execAsyncWithCallback } = require('../util/exec-async-command');
const pathExists = require('../util/path-exists');

const checkMagentoProject = async () => pathExists(path.join(process.cwd(), 'app'));

const installApp = async ({ output }) => {
    try {
        output.start('Creating Magento project...');
        // eslint-disable-next-line max-len
        await execAsyncWithCallback(
            `${phpBinPath} ${composerBinPath} create-project --repository=https://repo.magento.com/ magento/project-community-edition src`,
            {
                callback: (line) => {
                    if (line.includes('Updating dependencies')) {
                        output.text = 'Updating dependencies...';
                    }
                    // This needs to show user magento installation progress in console
                    if (/ - Installing (\S+) \((\S+)\)/ig.test(line)) {
                        const match = line.match(/ - installing (\S+) \((\S+)\)/ig)
                            .map((dep) => dep.match(/ - installing (\S+) \((\S+)\)/i).slice(1));

                        output.text = `Installing ${match.flat().join(' ')}`;
                    }
                }
            }
        );
        output.succeed('Project installed!');
        return true;
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while installing Magento application.',
            'See ERROR log above.'
        );

        return false;
    }
};

const installMagento = async () => {
    const output = ora('Checking Composer...').start();

    const hasMagentoApp = await checkMagentoProject();

    if (!hasMagentoApp) {
        output.warn('Magento application not found, installing...');
        const installAppOk = await installApp({ output });
        if (!installAppOk) {
            return false;
        }
    }

    output.stop();

    return true;
};

module.exports = installMagento;
