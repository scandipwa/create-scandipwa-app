const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');

const installDeps = (pathname) => (
    execCommandAsync(
        shouldUseYarn() ? 'yarnpkg' : 'npm',
        ['install'],
        pathname
    )
);

module.exports = installDeps;
