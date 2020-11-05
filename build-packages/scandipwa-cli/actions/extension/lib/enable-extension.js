const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');

const enableExtension = (packageName) => {
    const packagePath = `${process.cwd()}/package.json`;
    const packageJson = require(packagePath);

    if (!packageJson.scandipwa.extensions) {
        packageJson.scandipwa.extensions = {};
    }

    packageJson.scandipwa.extensions[packageName] = true;

    writeJson(
        packagePath,
        packageJson
    );
};

module.exports = enableExtension;
