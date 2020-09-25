/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable fp/no-loops */
const path = require('path');
const fs = require('fs');
const { sources, PROJECT } = require('./sources');
const { getParentThemeAliases } = require('@scandipwa/scandipwa-dev-utils/parent-theme');

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
    ...getParentThemeAliases()
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
            (acc, [key, pathname]) => {
                const currentKey = `${ key }/*`;

                /**
                 * Map paths to a source key, include paths from keys
                 * which include the current path, i.e.
                 * `SourceComponent` should also include `Component`
                */
                const matchingPaths = Object.entries(acc).reduce(
                    (foundPaths, [prevKey, prevPaths]) => {
                        if (currentKey.includes(prevKey)) {
                            foundPaths.push(...prevPaths);
                        }

                        return foundPaths;
                    },
                    []
                );

                acc[currentKey] = [
                    ...matchingPaths,
                    `${path.relative(process.cwd(), pathname)}/*`
                ];

                return acc;
            },
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
