/* eslint-disable max-len */
const { exec, spawn } = require('child_process');

/**
 * Execute bash command
 * @param {String} command Bash command
 * @param {Object} options Child process exec options ([docs](https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback))
 * @returns {Promise<String>}
 */
const execAsync = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => (err ? reject(err) : resolve(stdout)));
});

const execAsyncSpawn = (command, {
    callback = () => {}, logOutput = false, cwd, withCode = false
} = {}) => {
    const childProcess = spawn(
        'bash',
        ['-c', command],
        {
            stdio: 'pipe',
            cwd
        }
    );

    return new Promise((resolve, reject) => {
        let stdout = '';
        function addLine(data) {
            stdout += data;
            callback(data.toString());
            if (logOutput) {
                process.stdout.write(`${data.toString() }\n`, 'utf-8');
            }
        }
        childProcess.stdout.on('data', addLine);
        childProcess.stderr.on('data', addLine);
        childProcess.on('error', (error) => {
            reject(error);
        });
        childProcess.on('close', (code) => {
            if (code > 0) {
                reject(withCode ? { code, result: stdout } : stdout);
            } else {
                resolve(withCode ? { code, result: stdout } : stdout);
            }
        });
    });
};

const execAsyncBool = async (command, options) => {
    const result = await execAsync(command, options);
    if (result.toString().trim() === '1') {
        throw new Error('');
    }
};

module.exports = {
    execAsync,
    execAsyncBool,
    execAsyncSpawn
};
