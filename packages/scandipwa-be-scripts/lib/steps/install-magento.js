/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const {
    php: { phpBinPath },
    composer: { composerBinPath },
    magento: { magentoBinPath },
    appPath,
    appVersion
} = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');
const pathExists = require('../util/path-exists');

const checkMagentoProject = async () => pathExists(appPath);

const installApp = async ({ output }) => {
    try {
        output.info('Creating Magento project...');
        // eslint-disable-next-line max-len
        await execAsyncSpawn(
            // `${phpBinPath} ${composerBinPath} create-project --repository=https://repo.magento.com/ magento/project-community-edition=${appVersion}src`,
            `${phpBinPath} ${composerBinPath} install --ansi --no-interaction --no-dev --verbose --prefer-dist --ignore-platform-reqs`,
            {
                callback: (line) => {
                    line.split('\n').forEach((l) => output.info(l));
                    // output.info(line);
                    // if (line.includes('Updating dependencies')) {
                    //     output.text = 'Updating dependencies...';
                    // }
                    // // This needs to show user magento installation progress in console
                    // if (/ - Installing (\S+) \((\S+)\)/ig.test(line)) {
                    //     const match = line.match(/ - installing (\S+) \((\S+)\)/ig)
                    //         .map((dep) => dep.match(/ - installing (\S+) \((\S+)\)/i).slice(1));

                    //     output.info(`Installing ${match.flat().join(' ')}`);
                    // }
                },
                cwd: appPath
            }
        );
        output.succeed('Project installed!');
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while installing Magento application.',
            'See ERROR log above.'
        );

        return false;
    }

    try {
        await execAsyncSpawn(
            `${phpBinPath} ${magentoBinPath} setup:di:compile`,
            { cwd: appPath, callback: (line) => line.split('\n').forEach((l) => output.info(l)) }
        );
    } catch (e) {
        logger.error(e);
        return false;
    }

    try {
        await execAsyncSpawn(
            `${phpBinPath} ${magentoBinPath} scandipwa:theme:bootstrap Scandiweb/pwa -n || true`,
            { cwd: appPath, callback: (line) => line.split('\n').forEach((l) => output.info(l)) }
        );

        return true;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

const installMagento = async () => {
    const output = ora('Checking Composer...').start();

    // const hasMagentoApp = await checkMagentoProject();

    // if (!hasMagentoApp) {
    output.warn('Magento application not found, installing...');
    const installAppOk = await installApp({ output });
    if (!installAppOk) {
        return false;
    }
    // }

    output.stop();

    return true;
};

module.exports = installMagento;
