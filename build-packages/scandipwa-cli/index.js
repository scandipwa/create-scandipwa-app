#!/usr/bin/env node

const yargs = require('yargs');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');

const actions = [
    require('./actions/extension'),
    require('./actions/create'),
    require('./actions/override'),
    require('./actions/deploy')
    // require('./actions/magento')
];

(async () => {
    const { version: currentVersion, name } = require('./package.json');

    try {
        const latestVersion = await getLatestVersion(name);

        if (semver.gt(latestVersion, currentVersion)) {
            logger.warn(
                `Global module ${ logger.style.misc(name) } is out-dated.`,
                `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
                `You can do it by running following command: ${ logger.style.command(`npm install -g ${ name }@latest`) }.`
            );
        }
    } catch (e) {
        logger.warn(`Package ${ logger.style.misc(name) } is not yet published.`);
        logger.log(); // add empty line
    }

    yargs
        .scriptName('scandipwa')
        .demandCommand();

    // Initialize program actions
    actions.forEach((action) => action(yargs));

    // eslint-disable-next-line no-unused-expressions
    yargs.argv;
})();
