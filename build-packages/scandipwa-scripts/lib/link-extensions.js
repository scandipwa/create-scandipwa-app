const path = require('path');

const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');

module.exports = async () => {
    const { dependencies } = getPackageJson(process.cwd());

    if (!dependencies) {
        return;
    }

    const command = shouldUseYarn() ? 'yarnpkg' : 'npm';

    const linkPromises = Object.entries(dependencies).reduce((acc, [name, version]) => {
        if (!version.startsWith('file:')) {
            // skip all non file dependencies
            return acc;
        }

        // to get path from file:/path trim first 5 symbols
        const packagePath = path.join(process.cwd(), version.slice(5));

        // call async IIFE to get the promise
        const linkPromise = (async () => {
            await execCommandAsync(command, ['link'], packagePath);
            await execCommandAsync(command, ['link', name], process.cwd());
        })();

        // populate the array with new link promise
        return [...acc, linkPromise];
    }, []);

    await Promise.all(linkPromises);
};
