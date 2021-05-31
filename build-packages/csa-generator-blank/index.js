const path = require('path');
const installDeps = require('@scandipwa/scandipwa-dev-utils/install-deps');
const createFilesystem = require('@scandipwa/common-dev-utils/create-filesystem');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const shouldUseYarn = require('@scandipwa/common-dev-utils/should-use-yarn');
const logger = require('@scandipwa/common-dev-utils/logger');
const execCommandAsync = require('@scandipwa/common-dev-utils/exec-command');
const getPackagePath = require('@scandipwa/common-dev-utils/package-path');

const eslintFix = (destination) => {
    const eslintPath = getPackagePath('eslint', destination);
    const binPath = path.join(eslintPath, 'bin', 'eslint.js');
    return execCommandAsync('node', [
        binPath,
        'src',
        '--resolve-plugins-relative-to', '.',
        '--no-error-on-unmatched-pattern',
        '--ext', '.js',
        '--fix'
    ], destination);
};

const greet = (
    name,
    pathname
) => {
    const relativePathname = `.${ path.sep }${ pathname }`;
    const displayedCommand = shouldUseYarn() ? 'yarn' : 'npm run';

    logger.logN(`Success! Created blank ScandiPWA app "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);

    logger.log('Inside that directory, you can run several commands:');
    logger.logT(
        logger.style.command(`${displayedCommand} start`),
        logger.style.comment('Starts the development server')
    );
    logger.logT(
        logger.style.command(`${displayedCommand} build`),
        logger.style.comment('Bundles the app into static files for production')
    );

    logger.log('We suggest that you begin by typing:');
    logger.logT(logger.style.command('cd'), relativePathname);
    logger.logT(logger.style.command(`${displayedCommand} start`));

    logger.log(); // add empty line
    logger.logN('Happy coding! <3');
};

const fileSystemCreator = (templateOptions) => (
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

        filesystem.copy(
            templatePath('sample.gitignore'),
            destinationPath('.gitignore')
        );

        filesystem.copy(
            templatePath('README.md'),
            destinationPath('README.md')
        );

        filesystem.copy(
            templatePath('i18n/**/*'),
            destinationPath('i18n'),
            { globOptions: { dot: true } }
        );

        filesystem.copy(
            templatePath('public/**/*'),
            destinationPath('public'),
            { globOptions: { dot: true } }
        );

        filesystem.copy(
            templatePath('src/**/*'),
            destinationPath('src'),
            { globOptions: { dot: true } }
        );
    }
);

const run = async (options) => {
    const {
        name,
        path: pathname
    } = options;

    const destination = path.join(process.cwd(), pathname);

    let scandipwaScriptsVersion = '0.0.0';

    try {
        scandipwaScriptsVersion = await getLatestVersion('@scandipwa/scandipwa-scripts');
    } catch (e) {
        logger.warn(
            `Package ${ logger.style.misc('@scandipwa/scandipwa-scripts') } is not yet published.`
        );
    }

    let mosaicVersion = '0.0.0';

    try {
        mosaicVersion = await getLatestVersion('@tilework/mosaic');
    } catch (e) {
        logger.warn(
            `Unable to determine the latest version of package ${logger.style.misc('@tilework/mosaic')}`
        );
    }

    const templateOptions = {
        scandipwaScriptsVersion,
        mosaicVersion,
        name
    };

    // create filesystem from template
    await createFilesystem(
        destination,
        path.join(__dirname, 'template'),
        fileSystemCreator(templateOptions)
    );

    // install dependencies
    await installDeps(destination);

    // fix the ESLint (package-name)
    await eslintFix(destination);

    // greet the user
    greet(name, pathname);
};

module.exports = run;
