/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const {
    php: { phpBinPath },
    composer: { composerBinPath }
} = require('../config');
const { execAsync } = require('../util/exec-async');

const checkMagentoProject = async () => false; // pathExists(path.join(process.cwd(), 'app', 'etc', 'env.php'));

const installApp = async ({ output }) => {
    try {
        output.start('Creating Magento project...');
        // eslint-disable-next-line max-len
        await execAsync(`${phpBinPath} ${composerBinPath} create-project --repository=https://repo.magento.com/ magento/project-community-edition src`);
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
