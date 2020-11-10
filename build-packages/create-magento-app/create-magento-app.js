const semver = require('semver');
const path = require('path');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createFilesystem = require('./lib/create-filesystem');
const installDeps = require('./lib/install-deps');
const greet = require('./lib/greet');
const { execSync } = require('child_process');

const createApp = async (options) => {
    const {
        name,
        path: pathname
    } = options;

    const destination = path.join(process.cwd(), pathname);

    let latestVersion = '0.0.0';

    try {
        latestVersion = await getLatestVersion('@scandipwa/scandipwa-be-scripts');
    } catch (e) {
        logger.warn(
            `Package ${ logger.style.misc('@scandipwa/scandipwa-be-scripts') } is not yet published.`
        );
    }

    const templateOptions = {
        scandipwaBeScriptsVersion: latestVersion,
        name
    };

    // create filesystem from template
    await createFilesystem(
        destination,
        path.join(__dirname, 'template'),
        (
            filesystem,
            templatePath,
            destinationPath
        ) => {
            filesystem.copyTpl(
                templatePath('package.json'),
                destinationPath('package.json'),
                templateOptions
            );
        }
    );

    // install dependencies
    await installDeps(destination);

    // greet the user
    greet(name, pathname);
};

// eslint-disable-next-line consistent-return
const init = async (options) => {
    let latest;

    try {
        latest = await getLatestVersion('create-magento-app');
    } catch (e) {
        try {
            latest = execSync('npm view create-magento-app version').toString().trim();
        } catch (e) {
            logger.warn(
                `Package ${ logger.style.misc('create-magento-app') } is not yet published.`
            );
        }
    }

    if (!latest) {
        await createApp(options);
        return;
    }

    const packageJson = require('./package.json');

    if (latest && semver.lt(packageJson.version, latest)) {
        logger.error(
            `You are running ${logger.style.misc('create-magento-app')} ${logger.style.misc(packageJson.version)}, which is behind the latest release ${logger.style.misc(latest)}.`,
            'We no longer support global installation of Create Magento App.'
        );

        logger.log('Please remove any global installs with one of the following commands:');
        logger.logT('npm uninstall -g create-magento-app');
        logger.logT('yarn global remove create-magento-app');

        process.exit(1);
    } else {
        await createApp(options);
    }
};

module.exports = init;
