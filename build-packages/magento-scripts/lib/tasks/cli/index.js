const path = require('path');
const { spawn } = require('child_process');

const cli = () => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    spawn('bash', [
        '--rcfile',
        path.join(__dirname, '.magentorc')
    ], {
        stdio: [0, 1, 2]
    });

    return new Promise((_resolve) => {
        // never resolve
    });
};

module.exports = cli;
