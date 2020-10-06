const path = require('path');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');

module.exports = async (packageName, packagePath) => {
    await execCommandAsync(
        'npm',
        ['link'],
        path.join(process.cwd(), packagePath)
    );

    await execCommandAsync(
        'npm',
        ['link', packageName],
        process.cwd()
    );
};
