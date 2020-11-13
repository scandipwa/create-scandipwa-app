const path = require('path');
const createFilesystem = require('@scandipwa/scandipwa-dev-utils/create-filesystem');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const greet = (
    name,
    pathname
) => {
    // logger.clear();
    const relativePathname = `./${pathname}`;
    logger.logN(`Success! Created ScandiPWA extension "${ logger.style.misc(name) }" at ${ logger.style.file(relativePathname) }!`);
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

    const templateOptions = {
        scandipwaVersion: await getLatestVersion('@scandipwa/scandipwa'),
        name
    };

    // create filesystem from template
    await createFilesystem(
        pathname,
        path.join(__dirname, 'template'),
        fileSystemCreator(templateOptions)
    );

    // greet the user
    greet(name, pathname);
};

module.exports = run;
