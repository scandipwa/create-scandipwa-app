const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const isValidPackageName = require('@scandipwa/scandipwa-dev-utils/validate-package-name');
const generateExtension = require('@scandipwa/csa-generator-extension');
const installDeps = require('@scandipwa/scandipwa-dev-utils/install-deps');
const { walkDirectoryUp, contextTypes: { THEME_TYPE } } = require('@scandipwa/scandipwa-dev-utils/get-context');

const enableExtension = require('./lib/enable-extension');
const addDependency = require('./lib/add-dependency');
const injectScripts = require('./lib/inject-scripts');

const createExtension = async (argv) => {
    const {
        enable = true,
        package: packageName
    } = argv;

    const { type: context, pathname: contextPathname } = walkDirectoryUp(process.cwd(), THEME_TYPE);

    if (!context) {
        // make sure we are in ScandiPWA theme context
        logger.error(
            'To create an extension you must be located in ScandiPWA theme directory.',
            `We looked up six folders up starting from ${ logger.style.file(process.cwd()) }!`,
            `There was no folders containing ${ logger.style.file('package.json') }, where ${ logger.style.misc('scandipwa.type') } field was equal to ${ logger.style.misc('theme') }.`
        );

        process.exit();
    }

    if (!isValidPackageName(packageName)) {
        // validate extension package name
        process.exit();
    }

    const relativePackagePath = path.join(
        'packages',
        packageName.split(packageName.sep).pop()
    );

    const packagePath = path.join(
        contextPathname,
        relativePackagePath
    );

    try {
        // generate extension
        await generateExtension({
            name: packageName,
            path: packagePath
        });
    } catch (e) {
        logger.log(e);

        logger.error(
            `Failed to create ScandiPWA extension in ${ logger.style.file(packagePath) }.`,
            'See the error log above.'
        );

        process.exit();
    }

    try {
        // add package as dependency and install sub-dependencies
        await injectScripts(contextPathname);
        await addDependency(contextPathname, packageName, `file:${ relativePackagePath }`);
        await installDeps(contextPathname);
    } catch (e) {
        logger.log(e);

        logger.error(
            `Failed to install ScandiPWA extension in ${ logger.style.file(contextPathname) }.`,
            'See the error log above.'
        );

        process.exit();
    }

    if (enable) {
        enableExtension(contextPathname, packageName);
    }
};

const installExtension = async (argv) => {
    const {
        enable = true,
        package: packageName
    } = argv;

    const { type: context, pathname: contextPathname } = walkDirectoryUp(process.cwd(), THEME_TYPE);

    if (!context) {
        // make sure we are in ScandiPWA theme context
        logger.error(
            'To create an extension you must be located in ScandiPWA theme directory.',
            `We looked up six folders up starting from ${ logger.style.file(process.cwd()) }!`,
            `There was no folders containing ${ logger.style.file('package.json') }, where ${ logger.style.misc('scandipwa.type') } field was equal to ${ logger.style.misc('theme') }.`
        );

        process.exit();
    }

    try {
        // add package as dependency and install sub-dependencies
        await addDependency(contextPathname, packageName);
        await installDeps(contextPathname);
    } catch (e) {
        logger.log(e);

        logger.error(
            `Failed to install ScandiPWA extension in ${ logger.style.file(contextPathname) }.`,
            'See the error log above.'
        );

        process.exit();
    }

    if (enable) {
        enableExtension(contextPathname, packageName);
    }
};

module.exports = (yargs) => {
    yargs.command('extension <command>', 'Interact with extension', (yargs) => {
        yargs.command('install <package>', 'Install and enable ScandiPWA extension', (yargs) => {
            yargs.option('no-enable', {
                describe: 'Do not enable installed extension.'
            });
        }, installExtension);

        yargs.command('search <query>', 'Search for available extension.', () => {}, (argv) => {
            // TODO: implement search extension
            console.log('srch', argv);
        });

        yargs.command('create <package>', 'Create and enable new ScandiPWA extension', (yargs) => {
            yargs.option('no-enable', {
                describe: 'Do not enable installed extension.'
            });
        }, createExtension);
    });
};
