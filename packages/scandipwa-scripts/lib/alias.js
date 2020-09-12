/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable fp/no-loops */
const path = require('path');
const fs = require('fs');
const { sources, CORE, PROJECT } = require('./sources');

const aliasPostfixMap = {
    Style: './src/style/',
    Component: './src/component/',
    Route: './src/route/',
    Store: './src/store/',
    Util: './src/util/',
    Query: './src/query/',
    Type: './src/type/'
};

const sourcePrefixMap = {
    [PROJECT]: '',
    [CORE]: 'Source'
};

const alias = {};

/**
 * Glue together:
 * - source prefix + alias postfix
 * - source path + alias relative path
 */
for (const source in sourcePrefixMap) {
    const prefix = sourcePrefixMap[source];

    for (const postfix in aliasPostfixMap) {
        const aliasKey = prefix + postfix;
        const aliasPath = path.join(sources[source], aliasPostfixMap[postfix]);
        alias[aliasKey] = aliasPath;
    }
}

// TODO: generate jsconfig.js for VSCode suggestions
const jsConfig = {
    compilerOptions: {
        baseUrl: './',
        paths: Object.entries(alias).reduce(
            (acc, [key, path]) => ({
                ...acc,
                [`${ key }/*`]: [`${ path }/*`]
            }),
            {}
        )
    }
};

fs.writeFileSync(
    path.join(process.cwd(), 'jsconfig.json'),
    // eslint-disable-next-line no-magic-numbers
    JSON.stringify(jsConfig, undefined, 4)
);

module.exports = alias;
