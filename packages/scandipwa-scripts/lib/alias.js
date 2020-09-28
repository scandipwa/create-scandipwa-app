/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable fp/no-loops */
const path = require('path');
const { sources, PROJECT } = require('./sources');
const { getParentThemeAliases } = require('@scandipwa/scandipwa-dev-utils/parent-theme');
const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');

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

const aliasMap = {};

/**
 * Glue together:
 * - source prefix + alias postfix
 * - source path + alias relative path
 */
for (const source in sourcePrefixMap) {
    const prefix = sourcePrefixMap[source];
    aliasMap[source] = {};

    for (const postfix in aliasPostfixMap) {
        const aliasKey = prefix + postfix;
        const aliasPath = path.join(sources[source], aliasPostfixMap[postfix]);
        aliasMap[source][aliasKey] = aliasPath;
    }
}

/**
 * These aliases are used by Babel
 */
const alias = Object.entries(aliasMap).reduce(
    (acc, [, values]) => ({ ...acc, ...values }), {}
);

/**
 * These aliases are used in JSConfig by VSCode
 *
 * NOTE: the reduce right is used, so child themes, contain alises
 * to their child parent themes
 */
const { jsConfigAlises } = Object.entries(aliasMap).reduceRight(
    (acc, [, aliasPathMap]) => {
        Object.entries(aliasPathMap).forEach(
            ([alias, pathname], i) => {
                acc.aliasStack[i].push(
                    // it is required to be relative, otherwise it does not work
                    `${path.relative(process.cwd(), pathname)}/*`
                );

                acc.jsConfigAlises[`${ alias }/*`] = Array.from(acc.aliasStack[i]);
            }
        );

        return acc;
    },
    {
        aliasStack: Array.from(Object.keys(aliasPostfixMap), () => ([])),
        jsConfigAlises: {}
    }
);

// TODO: generate jsconfig.js for VSCode suggestions
const jsConfig = {
    compilerOptions: {
        baseUrl: './',
        paths: jsConfigAlises
    }
};

writeJson(
    path.join(process.cwd(), 'jsconfig.json'),
    jsConfig
);

module.exports = alias;
