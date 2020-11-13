const spawn = require('cross-spawn');

const execCommandAsync = (
    command,
    cwd = process.cwd(),
    isReturnLogs = false,
    callback
) => new Promise((resolve, reject) => {
    const output = '';

    const child = spawn(
        'bash',
        ['-c', command],
        {
            stdio: isReturnLogs ? 'pipe' : 'inherit',
            cwd
        }
    );

    if (isReturnLogs) {
        // Make sure data is logged (but only if we were asked to suppress logs)
        const addLine = (data) => {
            if (callback && isReturnLogs) {
                // if there is a callback call it
                callback(data.toString());
            }

            output.concat(data);
        };

        child.stdout.on('data', addLine);
        child.stderr.on('data', addLine);
    }

    child.on('error', (error) => {
        reject(error);
    });

    child.on('close', (code) => {
        if (code !== 0) {
            reject(isReturnLogs ? output : code);
            return;
        }

        resolve(isReturnLogs ? output : code);
    });
});

module.exports = execCommandAsync;
