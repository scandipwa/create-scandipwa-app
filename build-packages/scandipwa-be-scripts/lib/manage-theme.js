const path = require('path');
const fs = require('fs');
const pathExists = require('./util/path-exists');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { runComposerCommand } = require('./util/run-composer');
const { runMagentoCommand } = require('./util/run-magento');
const { getCachedPorts } = require('./util/get-ports');

const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath);

    if (!composerExists) {
        return false;
    }

    const composerData = JSON.parse(await fs.promises.readFile(composerPath));

    return composerData;
};

const commandLogger = {
    callback: (l) => l.split('\n').forEach((line) => output.info(line))
};

const installTheme = async ({ themePath }) => {
    output.info('Checking theme folder...');

    const absoluteThemePath = path.join(process.cwd(), themePath);

    const composerData = await getComposerData(path.join(absoluteThemePath, 'composer.json'));

    if (!composerData) {
        logger.error(`composer.json file not found in "${themePath}". Aborting installation...`);
        output.stop();

        return false;
    }
    output.succeed('Theme folder looks ok!');

    output.info('Setting symbolic link for theme in composer.');
    try {
        await runComposerCommand(`config repo.scandipwa path ${absoluteThemePath}`, commandLogger);
        output.succeed('Symbolic link for theme set!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while configuring theme symbolic link.',
            'See ERROR log above.'
        );

        return false;
    }

    const ports = await getCachedPorts();

    output.info('Setting up redis...');

    try {
        /**
         * TODO move this block inside theme folder as post installation command
         */
        await runMagentoCommand(`setup:config:set \
        --pq-host=localhost \
        --pq-port=${ports.redis} \
        --pq-database=5 \
        --pq-scheme=tcp \
        -n`, commandLogger);
        output.succeed('redis is set for persistent query!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while setting redis for pq!.',
            'See ERROR log above.'
        );

        return false;
    }

    output.info('Installing theme...');
    try {
        await runComposerCommand(`require ${composerData.name}`, commandLogger);
        output.succeed('Theme installed!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while installing theme.',
            'See ERROR log above.'
        );

        return false;
    }

    output.info('Upgrading magento...');
    try {
        await runMagentoCommand('setup:upgrade', commandLogger);
        output.succeed('Magento upgraded!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while upgrading magento.',
            'See ERROR log above.'
        );

        return false;
    }

    output.info('Disabling full_page cache');

    try {
        await runMagentoCommand('cache:disable full_page', commandLogger);
        output.succeed('Full page cache disabled!');
    } catch (e) {
        logger.error(e);

        logger.error(
            'Unexpected error while disabling full page cache.',
            'See ERROR log above.'
        );

        return false;
    }

    return true;
};

module.exports = {
    installTheme
};
