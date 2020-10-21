/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const {
    php: { phpBinPath },
    composer: {
        composerBinPath,
        composerComposerSetupPath,
        composerDirPath
    }
} = require('../config');
const createDirSafe = require('../util/create-dir-safe');
const { execAsync } = require('../util/exec-async-command');
const pathExists = require('../util/path-exists');

const checkComposerInCache = async () => pathExists(composerBinPath);

const installComposerInCache = async ({ output }) => {
    await createDirSafe(composerDirPath);
    try {
        output.start('Downloading composer...');
        await execAsync(`${phpBinPath} -r "copy('https://getcomposer.org/installer', '${composerComposerSetupPath}');"`);
        output.text = 'Checking installer integrity...';
        // eslint-disable-next-line max-len
        await execAsync(`${phpBinPath} -r "if (hash_file('sha384', '${composerComposerSetupPath}') === 'c31c1e292ad7be5f49291169c0ac8f683499edddcfd4e42232982d0fd193004208a58ff6f353fde0012d35fdd72bc394') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('${composerComposerSetupPath}'); } echo PHP_EOL;"`);
        output.text = 'Installing composer...';
        await execAsync(`${phpBinPath} ${composerComposerSetupPath} --install-dir=${composerDirPath}`);
        output.text = 'Removing installer...';
        await execAsync(`rm ${composerComposerSetupPath}`);

        const composerVersionOutput = await execAsync(`${phpBinPath} ${composerBinPath} --version --no-ansi`);
        const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];

        output.succeed(`Composer ${composerVersion} installed locally!`);
        return true;
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while installing PHP Composer.',
            'See ERROR log above.'
        );

        return false;
    }
};

const installComposer = async () => {
    const output = ora('Checking Composer...').start();

    const hasComposerInCache = await checkComposerInCache();

    if (!hasComposerInCache) {
        output.warn('PHP Composer not found locally, installing...');
        const installComposerOk = await installComposerInCache({ output });
        if (!installComposerOk) {
            return false;
        }
    } else {
        const composerVersionOutput = await execAsync(`${phpBinPath} ${composerBinPath} --version --no-ansi`);
        const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];

        output.succeed(`Using composer version ${composerVersion}`);
    }

    output.stop();

    return true;
};

module.exports = installComposer;
