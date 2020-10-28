const fs = require('fs');
const path = require('path');
const memFs = require('mem-fs');
const editor = require('mem-fs-editor');

const createFilesystem = (
    destinationPathname,
    templatePathname,
    fileSystemCreator
) => {
    const store = memFs.create();
    const filesystem = editor.create(store);

    const templatePath = (pathname = '') => path.join(
        templatePathname,
        pathname
    );

    const destinationPath = (pathname = '') => path.join(
        destinationPathname,
        pathname
    );

    // Create destination path
    fs.mkdirSync(destinationPath(), { recursive: true });

    fileSystemCreator(
        filesystem,
        templatePath,
        destinationPath
    );

    return new Promise((resolve) => {
        filesystem.commit([], resolve);
    });
};

module.exports = createFilesystem;
