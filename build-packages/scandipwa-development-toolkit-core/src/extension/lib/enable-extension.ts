const writeJson = require('@scandipwa/common-dev-utils/write-json');

const enableExtension = (
    themePath: string, 
    extensionName: string
) => {
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

export default enableExtension;