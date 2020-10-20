/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable fp/no-loops */
const path = require('path');
const { sources, PROJECT } = require('./sources');
const { getParentThemeAliases } = require('@scandipwa/scandipwa-dev-utils/parent-theme');
const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');
const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');

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

// Generate aliases for preference first
const preferenceAliases = extensions.reduce((acc, extension) => {
    const { packageJson, packagePath } = extension;

    // Take provide field, check if pathname is not available in provisioned names
    const {
        scandipwa: {
            preference = ''
        } = {}
    } = packageJson;

    if (!preference) {
        return acc;
    }

    return {
        ...acc,
        [`${preference}/*`]: [path.relative(process.cwd(), packagePath)]
    };
}, {});

/**
 * These aliases are used in JSConfig by VSCode
 *
 * NOTE: the reduce right is used, so child themes, contain alises
 * to their child parent themes
 */
const { parentThemeAliases } = Object.entries(aliasMap).reduceRight(
    (acc, [, aliasPathMap]) => {
        Object.entries(aliasPathMap).forEach(
            ([alias, pathname], i) => {
                acc.aliasStack[i].push(
                    // it is required to be relative, otherwise it does not work
                    `${path.relative(process.cwd(), pathname)}/*`
                );

                acc.parentThemeAliases[`${ alias }/*`] = Array.from(acc.aliasStack[i]);
            }
        );

        return acc;
    },
    {
        aliasStack: Array.from(Object.keys(aliasPostfixMap), () => ([])),
        parentThemeAliases: {}
    }
);

// TODO: generate jsconfig.js for VSCode suggestions
const jsConfig = {
    compilerOptions: {
        baseUrl: './',
        jsx: 'react',
        paths: {
            ...parentThemeAliases,
            ...preferenceAliases
        }
    }
};

writeJson(
    path.join(process.cwd(), 'jsconfig.json'),
    jsConfig
);

module.exports = alias;
