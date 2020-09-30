const spawn = require('cross-spawn');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');

const installDeps = (pathname) => new Promise((resolve, reject) => {
    const command = shouldUseYarn()
        ? 'yarnpkg'
        : 'npm';

    const child = spawn(
        command,
        ['install'],
        {
            stdio: 'inherit',
            cwd: pathname
        }
    );

    child.on('close', (code) => {
        if (code !== 0) {
            reject();
            return;
        }

        resolve();
    });
});

module.exports = installDeps;
