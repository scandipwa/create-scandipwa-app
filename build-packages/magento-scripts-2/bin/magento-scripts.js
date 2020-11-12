#!/usr/bin/env node

const yargs = require('yargs');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');

const commands = [
    require('../lib/commands/link'),
    require('../lib/commands/logs'),
    require('../lib/commands/cli'),
    require('../lib/commands/start'),
    require('../lib/commands/stop')
];

(async () => {
    const { version: currentVersion, name } = require('../package.json');

    try {
        const latestVersion = await getLatestVersion(name);

        if (semver.gt(latestVersion, currentVersion)) {
            logger.warn(
                `Global module ${ logger.style.misc(name) } is out-dated.`,
                `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
                `You can do it by running following command: ${ logger.style.command(`npm upgrade -g ${ name }`) }.`
            );
        }
    } catch (e) {
        logger.warn(`Package ${ logger.style.misc(name) } is not yet published.`);
        logger.log(); // add empty line
    }

    yargs.scriptName('magento-scripts');

    // Initialize program commands
    commands.forEach((command) => command(yargs));

    // eslint-disable-next-line no-unused-expressions
    yargs.argv;
})();
