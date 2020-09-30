const path = require('path');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');
const isValidTheme = require('@scandipwa/scandipwa-dev-utils/validate-theme');
const generateExtension = require('@scandipwa/csa-generator-extension');
const addDependency = require('./lib/add-dependency');
const enableExtension = require('./lib/enable-extension');
const installDeps = require('create-scandipwa-app/lib/install-deps');
// const installLerna = require('./lib/install-lerna');

module.exports = (program) => {
    program
        .command('extension', 'Install, symlink or create ScandiPWA extension')
        .argument('<package name>', 'Name of the package to install / create')
        .argument('[version]', 'Version of the package to install')
        .option('--create <type>', 'Create a new extension')
        // TODO: add symlink option for development
        // .option('--symlink <type>', 'Symlink an existing extension')
        .action(async ({
            args: {
                packageName: name = '',
                version = ''
            },
            options: {
                create: isCreate,
                symlink: isSymlink
            }
        }) => {
            // Validate package name
            if (!isValidPackageName(name)) {
                process.exit();
            }

            const distPath = path.join(
                'packages',
                name.split('/').pop()
            );

            // Validate if command is run in the theme
            if (!isValidTheme(process.cwd())) {
                process.exit();
            }

            if (isCreate || isSymlink) {
                // Install lerna if this is a create or symlink request
                // await installLerna();
            }

            if (isCreate) {
                // Generate extension from template
                generateExtension({
                    name,
                    path: distPath
                });
            }

            // Use 0.0.0 in case the package is bootstrapped as new
            const realVersion = isCreate
                ? `file:${ distPath }`
                : version;

            // Inject dependency to package.json
            await addDependency(name, realVersion);

            // Enable extension in scandipwa field ofg package.json
            enableExtension(name);

            // Install dependencies
            await installDeps(process.cwd());
        });
};
