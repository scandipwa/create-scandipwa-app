const path = require('path');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const config = require('../config');
const compile = require('./compile');
const configure = require('./configure');
const createConfigurationFile = require('../util/create-config-file');

const build = async () => {
    const versionRegex = new RegExp(config.php.version);

    try {
        const phpVersions = await execCommandAsync(
            'phpbrew list',
            process.cwd(),
            true
        );

        if (!versionRegex.test(phpVersions)) {
            await compile();
        }

        await createConfigurationFile({
            pathname: config.php.iniPath,
            template: path.join(config.config.templateDir, 'php.template.ini'),
            isOverwrite: true
        });
    } catch (e) {
        logger.logN(e);

        logger.error(
            'Failed to extract the list of installed PHP versions.',
            'Possibly, you forgot to setup PHPBrew?',
            `Follow these instruction: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#setting-up') }`,
            'Otherwise, See error details in the output above.'
        );

        process.exit();
    }

    configure();
};

module.exports = build;
