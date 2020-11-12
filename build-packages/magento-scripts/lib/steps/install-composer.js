/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
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

const installComposerInCache = async () => {
    await createDirSafe(composerDirPath);
    try {
        logger.log('Downloading composer...');
        // install latest 1.x version
        await execAsync(`${phpBinPath} -r "copy('https://getcomposer.org/composer-1.phar', '${composerBinPath}');"`);

        const composerVersionOutput = await execAsync(`${phpBinPath} ${composerBinPath} --version --no-ansi`);
        const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];

        logger.log(`Composer ${composerVersion} installed locally!`);
        return true;
    } catch (e) {
        logger.error(e);
        logger.error(
            'Unexpected error while installing PHP Composer.',
            'See ERROR log above.'
        );

        return false;
    }
};

const getComposerVersion = async () => {
    const composerVersionOutput = await execAsync(`${phpBinPath} ${composerBinPath} --version --no-ansi`);
    const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];
    return composerVersion;
};

const installComposer = async () => {
    logger.log('Checking Composer...');

    const isComposerAuthOk = await checkComposerAuth();

    if (!isComposerAuthOk) {
        return false;
    }

    const hasComposerInCache = await checkComposerInCache();

    if (!hasComposerInCache) {
        logger.warn('PHP Composer not found locally, installing...');
        const installComposerOk = await installComposerInCache();
        if (!installComposerOk) {
            return false;
        }
    } else {
        const composerVersion = await getComposerVersion();
        logger.log(`Using composer version ${composerVersion}`);
    }

    return true;
};

module.exports = {
    installComposer,
    installComposerInCache,
    checkComposerInCache,
    checkComposerAuth,
    getComposerVersion
};
