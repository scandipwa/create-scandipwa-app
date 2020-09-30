#!/usr/bin/env node

const { program } = require('@caporal/core');

const actions = [
    require('./actions/extension')
];

// Initilize program actions
actions.forEach((action) => action(program));

program.run();
