#!/usr/bin/env node

const commands = {
    start: () => require('./start')(),
    stop: () => require('./stop')(),
    cleanup: () => require('./clean-up')(),
    restart: () => require('./restart')()
};

const args = process.argv.slice(2);

const commandList = Object.keys(commands);

const arg = args.find((x) => commandList.includes(x));

commands[arg]();
