const fs = require('fs');
const path = require('path');

const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');

module.exports = async () => {
    const packagesPath = path.join(process.cwd(), 'packages');

    if (!fs.existsSync(packagesPath)) {
        // no packages - no deal
        return;
    }

    const linkPromises = fs.readdirSync(packagesPath).map(async (folder) => {
        const packagePath = path.join(packagesPath, folder);
        const { name } = getPackageJson(packagePath);
        const command = shouldUseYarn() ? 'yarn' : 'npm';
        await execCommandAsync(`${ command } link`, packagePath);
        await execCommandAsync(`${ command } link ${ name }`, process.cwd());
    });

    await Promise.all(linkPromises);
};
