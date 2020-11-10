const path = require('path');
const createFilesystem = require('create-scandipwa-app/lib/filesystem');
// const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const fileSystemCreator = require('./lib/filesystem');
const greet = require('./lib/greet');

const run = async ({
    name,
    path: pathname
} = {}) => {
    const templateOptions = {
        scandipwaBeScriptsVersion: '0.0.0', // await getLatestVersion('@scandipwa/magento-scripts'),
        name
    };

    const destination = path.join(process.cwd(), pathname);

    // create filesystem from template
    await createFilesystem(
        destination,
        path.join(__dirname, 'template'),
        fileSystemCreator(templateOptions)
    );

    // greet the user
    greet(name, pathname);
};

module.exports = run;
