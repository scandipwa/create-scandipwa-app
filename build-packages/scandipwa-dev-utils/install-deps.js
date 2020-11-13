const shouldUseYarn = require('./should-use-yarn');
const execCommandAsync = require('./exec-command');

const installDeps = (pathname) => {
    const command = shouldUseYarn() ? 'yarnpkg' : 'npm';

    execCommandAsync(
        `${ command } install`,
        pathname
    );
};

module.exports = installDeps;
