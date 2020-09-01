/* eslint-disable import/no-dynamic-require, global-require */
const path = require('path');

const visitedDeps = [];

// collect composer dependencies
const getComposerDeps = (modulePath) => {
    if (visitedDeps.indexOf(modulePath) !== -1) {
        return [];
    }

    visitedDeps.push(modulePath);

    const {
        composer = [],
        dependencies = []
    } = require(path.join(modulePath, 'package.json')) || {};

    console.log(dependencies);

    return dependencies.reduce(
        (acc, dependency) => acc.concat(getComposerDeps(dependency)),
        Object.entries(composer)
    );
};

module.exports = () => {
    const composerDeps = getComposerDeps(process.cwd());

    console.log(composerDeps);
};
