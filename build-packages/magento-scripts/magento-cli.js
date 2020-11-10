#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const magentoCli = () => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    const spawnChild = () => spawn('bash', ['--rcfile', path.join(__dirname, '.magentorc')], {
        stdio: [0, 1, 2]
    });

    spawnChild();
};

module.exports = magentoCli;
