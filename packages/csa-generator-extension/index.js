const path = require('path');
const installDeps = require('create-scandipwa-app/lib/install-deps');
const createFilesystem = require('create-scandipwa-app/lib/filesystem');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const fileSystemCreator = require('./lib/filesystem');
const greet = require('./lib/greet');

const run = async (options) => {
    const {
        name,
        path: pathname
    } = options;

    const templateOptions = {
        scandipwaVersion: await getLatestVersion('@scandipwa/scandipwa'),
        name
    };

    const destination = path.join(process.cwd(), pathname);

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