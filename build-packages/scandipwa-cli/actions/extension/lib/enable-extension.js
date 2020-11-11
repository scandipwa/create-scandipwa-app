const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');

const enableExtension = (themePath, extensionName) => {
    const packagePath = `${ themePath }/package.json`;
    const packageJson = require(packagePath);

    if (!packageJson.scandipwa.extensions) {
        packageJson.scandipwa.extensions = {};
    }

    packageJson.scandipwa.extensions[extensionName] = true;

    writeJson(
        packagePath,
        packageJson
    );
};

module.exports = enableExtension;
