const fs = require('fs');
const path = require('path');

const getPackagePath = (packageName, context = process.cwd()) => {
    const possibleRelativePath = path.join(
        process.cwd(),
        packageName,
        'package.json'
    );

    const isPathReference = fs.existsSync(possibleRelativePath);

    if (isPathReference) {
        return path.join(possibleRelativePath, '..');
    }

    // This is not a local package, path based extension -> try loading it as a package
    return path.join(
        require.resolve(`${ packageName }/package.json`, { paths: [context] }),
        '..'
    );
};

module.exports = getPackagePath;
