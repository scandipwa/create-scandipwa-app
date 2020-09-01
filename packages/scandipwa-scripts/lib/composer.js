/* eslint-disable guard-for-in, fp/no-let, no-console, max-len, import/no-dynamic-require, global-require, fp/no-loops, no-restricted-syntax */
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');
const semverMinSatisfying = require('semver/ranges/min-satisfying');

const visitedDeps = [];

const getPackageJson = (pathname) => {
    try {
        return require(path.join(pathname, 'package.json')) || {};
    } catch (e) {
        return {};
    }
};

// collect composer dependencies
const getComposerDeps = (modulePath) => {
    if (visitedDeps.indexOf(modulePath) !== -1) {
        return [];
    }

    visitedDeps.push(modulePath);

    const {
        dependencies = {},
        composer = []
    } = getPackageJson(modulePath);

    return Object.keys(dependencies).reduce(
        (acc, dependency) => acc.concat(getComposerDeps(dependency)),
        Object.entries(composer)
    );
};

module.exports = () => {
    const expectedComposerDeps = getComposerDeps(process.cwd());
    const indexedComposerDeps = expectedComposerDeps.reduce((acc, [module, version]) => {
        if (!acc[module]) {
            acc[module] = [];
        }

        if (acc[module].indexOf(version) === -1) {
            acc[module].push(version);
        }

        return acc;
    }, {});

    // eslint-disable-next-line fp/no-let
    let composerContent = {};

    try {
        // Try loading the composer file in - if failed, show error.
        composerContent = require(path.join(process.cwd(), 'composer.json'));
    } catch (e) {
        console.log(`${ chalk.bgRed.black('ERROR!') } The required file ${ chalk.cyan('composer.json') } was not found! Please create a file with the name specified.`);
        return false;
    }

    const { require: composerDeps = {} } = composerContent;

    for (const composerModule in indexedComposerDeps) {
        // Loop over the indexed composer dependencies, check:
        // - if the version requested is valid
        // - if version requested is present in composer
        // - if version requested satisfies version defined

        const versionDefined = composerDeps[composerModule];
        let versionsExpected = [];

        if (!semver.validRange(versionDefined)) {
            console.log(`${ chalk.bgRed.black('ERROR!') } Currently required ${ chalk.green(composerModule) } composer module version ${ chalk.green(versionDefined) } is invalid.`);
            return false;
        }

        // validate all requested versions.
        for (let i = 0; i < indexedComposerDeps[composerModule].length; i++) {
            const version = indexedComposerDeps[composerModule][i];

            if (semver.validRange(version)) {
                versionsExpected.push(version);
            } else {
                console.log(`${ chalk.bgRed.black('ERROR!') } Module's ${ chalk.green(composerModule) } requested version ${ chalk.green(version) } is invalid.`);
                return false;
            }
        }

        versionsExpected = versionsExpected.join(' ');

        // This one is unstable and can not calculate value properly.
        // An issue to track: https://github.com/npm/node-semver/issues/340
        const minVersion = semver.minVersion(versionsExpected);

        // Validate if version requested is present in composer
        if (!composerDeps[composerModule]) {
            if (minVersion) {
                const minVersionString = chalk.bgGreen.black(`"${ composerModule }": "${ minVersion }"`);

                console.log(
                    `${ chalk.bgRed.black('ERROR!') } The required composer package is missing! `
                    + `Please add ${ minVersionString } to ${ chalk.green('"require"') } section of ${ chalk.cyan('composer.json') }!`
                );
            } else {
                console.log(
                    `${ chalk.bgRed.black('ERROR!') } The required composer package is missing! `
                    + `Please add ${ chalk.green(composerModule) } matching constraint ${ chalk.green(versionsExpected) } to ${ chalk.green('"require"') } section of ${ chalk.cyan('composer.json') }!`
                );
            }

            return false;
        }

        // Check if version requested satisfies version defined
        if (!semver.satisfies(versionDefined, versionsExpected)) {
            if (minVersion) {
                console.log(
                    `${ chalk.bgRed.black('ERROR!') } There are conflicting modules in ${ chalk.cyan('composer.json') }. `
                    + `Please update ${ chalk.green(composerModule) } to at least ${ chalk.green(minVersion) }.`
                );
            } else {
                console.log(
                    `${ chalk.bgRed.black('ERROR!') } There are conflicting modules in ${ chalk.cyan('composer.json') }. `
                    + `Current version ${ chalk.green(versionDefined) } does not satisfy ${ chalk.green(versionsExpected) } constraint.`
                );
            }

            return false;
        }
    }

    return true;
};
