const spawn = require('cross-spawn');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');

const installDeps = (pathname) => {
    return new Promise((resolve, reject) => {
        const command = shouldUseYarn()
            ? 'yarnpkg'
            : 'npm';

        const child = spawn(
            command,
            ['install', '--cwd', pathname],
            { stdio: 'inherit' }
        );

        child.on('close', code => {
            if (code !== 0) {
                reject();
                return;
            }

            resolve();
        });
    });
};

module.exports = installDeps;