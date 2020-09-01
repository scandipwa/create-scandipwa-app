/* eslint-disable guard-for-in, fp/no-let, no-console, max-len, import/no-dynamic-require, global-require, fp/no-loops, no-restricted-syntax */
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');
const minVersion = require('./helper/min-version');

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
    const requestedComposerDeps = getComposerDeps(process.cwd());

    // Index the composer deps from array of object entries.
    // Object should contain the ranges requested by requested module name
    const indexedComposerDeps = requestedComposerDeps.reduce((acc, [module, version]) => {
        if (!acc[module]) {
            acc[module] = [];
        }

        if (acc[module].indexOf(version) === -1) {
            acc[module].push(version);
        }

        return acc;
    }, {});

    let composerContent = {};

    try {
        // Try loading the composer file in - if failed, show error.
        composerContent = require(path.join(process.cwd(), 'composer.json'));
    } catch (e) {
        console.log(`${ chalk.bgRed.black('ERROR!') } The required file ${ chalk.cyan('composer.json') } was not found!`);
        return false;
    }

    const { require: composerDeps } = composerContent;

    if (!composerDeps) {
        console.log(`${ chalk.bgRed.black('ERROR!') } The required field ${ chalk.green('require') } is missing in ${ chalk.cyan('composer.json') }.`);
        return false;
    }

    for (const composerModule in indexedComposerDeps) {
        // Loop over the indexed composer dependencies, check:
        // - if the version requested is valid
        // - if the version requested is possible to satisfy
        // - if the version requested is present in composer
        // - if the version requested satisfies version required

        const versionRequired = composerDeps[composerModule];
        let rangeRequested = [];

        // Validate if the version required is valid
        if (!semver.validRange(versionRequired)) {
            console.log(`${ chalk.bgRed.black('ERROR!') } Required ${ chalk.green(composerModule) } composer module version ${ chalk.inverse(versionRequired) } is invalid.`);
            return false;
        }

        // Validate if the version requested is valid
        for (let i = 0; i < indexedComposerDeps[composerModule].length; i++) {
            const version = indexedComposerDeps[composerModule][i];

            if (semver.validRange(version)) {
                rangeRequested.push(version);
            } else {
                console.log(`${ chalk.bgRed.black('ERROR!') } The requested version ${ chalk.inverse(version) } of ${ chalk.green(composerModule) } is invalid.`);
                return false;
            }
        }

        rangeRequested = rangeRequested.join(' ');

        // This one is unstable and can not calculate value properly.
        // An issue to track: https://github.com/npm/node-semver/issues/340
        const { raw: minVersionRaw } = minVersion(rangeRequested) || {};

        // Validate if the version requested is possible to satisfy
        if (!minVersionRaw) {
            console.log(
                `${ chalk.bgRed.black('ERROR!') } The requested composer package versions conflict! `
                + `There are no versions of ${ chalk.green(composerModule) } matching the range ${ chalk.inverse(rangeRequested) }!`
            );
        }

        const minVersionString = chalk.inverse(`"${ composerModule }": "${ minVersionRaw }"`);

        // Validate if the version requested is present in composer + shwo notice about minimum version
        if (!composerDeps[composerModule]) {
            console.log(
                `${ chalk.bgRed.black('ERROR!') } The requested composer package is missing! `
                + `Please add ${ minVersionString } to ${ chalk.green('"require"') } section of ${ chalk.cyan('composer.json') }! `
            );

            console.log(
                `${ chalk.bgKeyword('orange').black('WARNING!') } The ${ chalk.inverse(minVersionRaw) } version is the minimum requested version. `
                `Update it at you own risk! The version of choice must meet following constraints: ${ chalk.inverse(rangeRequested) }!`
            );

            return false;
        }

        // Check if the version requested satisfies version required
        if (!semver.satisfies(versionRequired, rangeRequested)) {
            console.log(
                `${ chalk.bgRed.black('ERROR!') } Composer module required is conflicting with requested module versions. `
                + `Please update ${ chalk.green(composerModule) } version to ${ chalk.green(minVersionRaw) }.`
            );

            console.log(
                `${ chalk.bgKeyword('orange').black('WARNING!') } The ${ chalk.inverse(minVersionRaw) } version is the minimum requested version. `
                `Update it at you own risk! The version of choice must meet following constraints: ${ chalk.inverse(rangeRequested) }!`
            );

            return false;
        }
    }

    return true;
};
