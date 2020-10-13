const { exec, spawn } = require('child_process');

const execAsync = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) =>
      err ? reject(err) : resolve(stdout)
    )
})
// capture = don't output stdout/stderr, return with promises response
// echo = capture + output in the end
const execAsyncWithCallback = (command, { capture = false, echo = false, callback = () => {} } = {}) => {
    const rootCommand = command.split(' ').shift()
    const commandArgs = command.split(' ').slice(1)
    const childProcess = spawn(
        rootCommand,
        commandArgs,
        {
            stdio: capture ? 'pipe' : 'inherit'
        }
    );
    return new Promise((resolve, reject) => {
        let stdout = '';
        if (capture) {
            childProcess.stdout.on('data', (data) => {
                stdout += data;
                callback(data)
            });
            childProcess.stderr.on('data', (data) => {
                stdout += data;
                callback(data)
            });
        }
        childProcess.on('error', function (error) {
            reject(error);
        });
        childProcess.on('close', function (code) {
            if (capture && echo) console.log(stdout);
            if (code > 0) {
                reject(stdout);
            } else {
                resolve(stdout);
            }
        });
    });
};

const execAsyncBool = async (command, options) => {
    const result = await execAsync(command, options)
    if (result.toString().trim() === '1') {
        throw new Error('')
    }
}

module.exports = {
    execAsync,
    execAsyncBool,
    execAsyncWithCallback
}