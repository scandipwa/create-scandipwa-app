/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const ora = require('ora');
const {
    php: { phpBinPath },
    composer: {
        composerBinPath,
        composerDirPath
    }
} = require('../config');
const createDirSafe = require('../util/create-dir-safe');
const { execAsync } = require('../util/exec-async-command');
const pathExists = require('../util/path-exists');

const checkComposerInCache = async () => pathExists(composerBinPath);

const checkComposerAuth = async () => {
    try {
        const composeAuthVariable = await execAsync('echo $COMPOSER_AUTH');
        if (JSON.parse(composeAuthVariable)['http-basic']) {
            return true;
        }
        throw new Error('COMPOSER_AUTH env variable is corrupted');
    } catch (e) {
        logger.error(e);
        return false;
    }
};

const installComposerInCache = async ({ output }) => {
    await createDirSafe(composerDirPath);
    try {
        output.start('Downloading composer...');
        // install latest 1.x version
        await execAsync(`${phpBinPath} -r "copy('https://getcomposer.org/composer-1.phar', '${composerBinPath}');"`);

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
    const output = ora('Checking Composer...').info();

    await checkComposerAuth();

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
