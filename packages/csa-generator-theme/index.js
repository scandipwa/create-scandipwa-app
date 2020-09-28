const path = require('path');
const installDeps = require('create-scandipwa-app/lib/install-deps');
const createFilesystem = require('create-scandipwa-app/lib/filesystem');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const fileSystemCreator = require('./lib/filesystem');
const greet = require('./lib/greet');

const DEFAULT_PROXY = 'http://scandipwapmrev.indvp.com';

const run = async (options) => {
    const {
        name,
        path: pathname
    } = options;

    const destination = path.join(process.cwd(), pathname);

    const templateOptions = {
        scandipwaVersion: await getLatestVersion('@scandipwa/scandipwa'),
        scandipwaScriptsVersion: await getLatestVersion('@scandipwa/scandipwa-scripts'),
        name,
        proxy: DEFAULT_PROXY
    };

    // create filesystem from template
    await createFilesystem(
        destination,
        path.join(__dirname, 'template'),
        fileSystemCreator(templateOptions)
    );

    // install dependencies
    await installDeps(destination);

    // greet the user
    greet(name, pathname);
};

module.exports = run;