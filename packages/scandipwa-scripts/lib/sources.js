const path = require('path');

const PROJECT = 'project';
const CORE = 'core';

const sources = {
    [PROJECT]: process.cwd(),
    [CORE]: path.resolve(require.resolve('@scandipwa/scandipwa/src/index.js'), '../..')
};

module.exports = {
    sources,
    PROJECT,
    CORE
};
