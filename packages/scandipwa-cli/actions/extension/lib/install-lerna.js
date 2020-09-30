const fs = require('fs');
const path = require('path');
const addDependency = require('./add-dependency');
const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const installLerna = async () => {
    const lernaConfigPath = path.join(process.cwd(), 'lerna.json');

    if (fs.existsSync(lernaConfigPath)) {
        // Skip any installation, if config is present
        return;
    }

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packagePath);
    const preInstallCommand = 'lerna link';

    if (!packageJson.scripts) {
        // Add scripts field to package.json
        packageJson.scripts = {};
    }

    if (
        packageJson.scripts.preinstall
        && packageJson.scripts.preinstall !== preInstallCommand
    ) {
        /**
         * Make sure package.json does not have include preinstall
         * command which does not match neccessary command
         */

        logger.error(
            'Can not install Lerna (which is required to symlink local package).',
            `Please remove current ${ logger.style.misc('scripts.preinstall') } field from ${ logger.style.file('package.json') }.`
        );

        process.exit();
    }

    packageJson.scripts.preinstall = preInstallCommand;

    // Update package json with new scripts.preinstall field
    writeJson(packagePath, packageJson);

    // Add latest lerna as dev-dependency if it is not yet bootstrapped
    await addDependency('lerna', undefined, true);

    const lernaConfig = {
        packages: [
            '',
            'packages/*'
        ],
        npmClient: shouldUseYarn() ? 'yarn' : 'npm',
        version: 'independent'
    };

    // Write lerna config, use proper client
    writeJson(lernaConfigPath, lernaConfig);
};

module.exports = installLerna;
