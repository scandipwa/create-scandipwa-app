#!/usr/bin/env node

const runCraco = require('../lib/craco');
const linkExtensions = require('../lib/link-extensions');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex((x) => x === 'build' || x === 'start');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

const scriptMap = {
    build: runCraco,
    start: runCraco,
    link: linkExtensions
};

scriptMap[script]();
