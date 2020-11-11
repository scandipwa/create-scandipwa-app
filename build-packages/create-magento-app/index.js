#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const semver = require('semver');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const createFilesystem = require('@scandipwa/scandipwa-dev-utils/create-filesystem');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const installDeps = require('@scandipwa/scandipwa-dev-utils/install-deps');

const greet = (name, pathname) => {
    const relativePathname = `./${pathname}`;
    const displayedCommand = shouldUseYarn() ? 'yarn' : 'npm run';

    logger.logN(`Success! Created Magento 2 application "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);

    logger.log('Inside that directory, you can run several commands:');
    logger.logT(
        logger.style.command(`${displayedCommand} start`),
        logger.style.comment('Starts the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} stop`),
        logger.style.comment('Stops the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} restart`),
        logger.style.comment('Restart the Magento 2')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} cleanup`),
        logger.style.comment('Removes the Magento 2 installation')
    );

    logger.log(); // add empty line

    logger.log('We suggest that you begin by typing:');
    logger.logT(logger.style.command('cd'), relativePathname);
    logger.logT(logger.style.command(`${displayedCommand} start`));

    logger.log(); // add empty line

    logger.logN('Happy coding! <3');
};

const createApp = async (options) => {
    const {
        name,
        path: pathname
    } = options;

    const destination = path.join(process.cwd(), pathname);

    let latestVersion = '0.0.0';

    try {
        latestVersion = await getLatestVersion('@scandipwa/magento-scripts');
    } catch (e) {
        logger.warn(
            `Package ${ logger.style.misc('@scandipwa/magento-scripts') } is not yet published.`
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

const init = async (options) => {
    try {
        // Validate we are on the latest version of the application
        const latest = await getLatestVersion('create-magento-app');
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
        }
    } catch (e) {
        logger.warn(
            `Package ${ logger.style.misc('create-magento-app') } is not yet published.`
        );
    }

    await createApp(options);
};

// eslint-disable-next-line no-unused-expressions
yargs.command(
    '$0 <destination>',
    'Create Magento App',
    (yargs) => {
        yargs.example(
            '$0 my-app',
            'Creates a new Magento 2 application in the "my-app" folder relative to current working directory.'
        );
    },
    async (args) => {
        const { destination } = args;

        const pathArr = destination.split(path.sep);
        const name = pathArr.slice(-1);

        await init({
            name, // we do not care about organization it is or not
            path: destination
        });
    }
).argv;
