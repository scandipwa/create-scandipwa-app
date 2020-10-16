#!/usr/bin/env node

const commands = {
    start: () => require('./start')(),
    stop: () => require('./stop')(),
    cleanup: () => require('./clean-up')()
};

const args = process.argv.slice(2);

const arg = args.find((x) => x === 'start' || x === 'cleanup' || x === 'stop');

commands[arg]();
