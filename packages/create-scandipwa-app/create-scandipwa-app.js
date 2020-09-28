const semver = require('semver');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const templateMap = {
    'theme': require('@scandipwa/csa-generator-theme')
};

const createApp = async (options) => {
    const { template } = options;

    try {
        const generator = templateMap[template];

        if (generator) {
            // Run generator if it is available
            generator(options);
            return;
        }

        const templatesAvailable = Object.keys(templateMap).map(
            (key) => logger.style.misc(key)
        );

        logger.error(
            `The required template ${ logger.style.misc(template) } does not exist.`,
            `The available templates are: ${ templatesAvailable.join(', ') }.`
        );
    } catch (e) {
        logger.error('Something went wrong during setup. Error log bellow.');
        logger.logN(e);
    }
};

const init = (options) => {
    getLatestVersion('create-scandipwa-app')
        .catch(() => {
            try {
                return execSync('npm view create-scandipwa-app version').toString().trim();
            } catch (e) {
                return null;
            }
        })
        .then(latest => {
            const packageJson = require('./package.json');

            if (latest && semver.lt(packageJson.version, latest)) {
                logger.error(
                    `You are running ${logger.style.misc('create-scandipwa-app')} ${logger.style.misc(packageJson.version)}, which is behind the latest release ${logger.style.misc(latest)}.`,
                    'We no longer support global installation of Create ScandiPWA App.'
                );

                logger.log('Please remove any global installs with one of the following commands:');
                logger.logT('npm uninstall -g create-scandipwa-app');
                logger.logT('yarn global remove create-scandipwa-app');

                process.exit(1);
            } else {
                createApp(options);
            }
        });
}

module.exports = init;