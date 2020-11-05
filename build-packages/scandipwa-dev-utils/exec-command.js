const spawn = require('cross-spawn');

const execCommandAsync = (command, args, cwd) => new Promise((resolve, reject) => {
    const child = spawn(
        command,
        args,
        {
            stdio: 'inherit',
            cwd
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

module.exports = execCommandAsync;
