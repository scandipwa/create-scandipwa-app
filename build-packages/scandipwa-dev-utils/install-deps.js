const shouldUseYarn = require('./should-use-yarn');
const execCommandAsync = require('./exec-command');

const installDeps = (pathname) => (
    execCommandAsync(
        shouldUseYarn() ? 'yarnpkg' : 'npm',
        ['install'],
        pathname
    )
);

module.exports = installDeps;
