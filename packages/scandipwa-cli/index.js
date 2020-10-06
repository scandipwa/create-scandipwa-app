#!/usr/bin/env node

const { program } = require('@caporal/core');
const { version: currentVersion, name } = require('./package.json');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');

const actions = [
    require('./actions/extension')
];

(async () => {
    const latestVersion = await getLatestVersion(name);

    if (semver.gt(latestVersion, currentVersion)) {
        logger.warn(
            `Global module ${ logger.style.misc(name) } is out-dated.`,
            `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
            `You can do it by running following command: ${ logger.style.command(`npm upgrade -g ${ name }`) }.`
        );
    }

    // Initialize program actions
    actions.forEach((action) => action(program));

    program.run();
})();
