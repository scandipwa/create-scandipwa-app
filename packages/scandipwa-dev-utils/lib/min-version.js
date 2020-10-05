// TODO: remove and upgrade the semver after this PR will be merged (https://github.com/npm/node-semver/pull/341)

const SemVer = require('semver/classes/semver');
const Range = require('semver/classes/range');
const gt = require('semver/functions/gt');

const minVersion = (rangeExpected, loose) => {
    let minVersion = new SemVer('0.0.0');
    const range = new Range(rangeExpected, loose);

    if (rangeExpected === '*') {
        return { raw: '*' };
    }

    for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];

        for (let i = 0; i < comparators.length; i++) {
            const comparator = comparators[i];
            const version = new SemVer(comparator.semver.version);

            switch (comparator.operator) {
            case '>': // Larger
                if (version.prerelease.length === 0) {
                    // For pre-releases, bump it one up
                    version.patch++;
                } else {
                    // Otherwise, increase by one
                    version.prerelease.push(0);
                }

                version.raw = version.format();
                // vvv fallthrough to case bellow vvv
            case '':
            case '>=': // Exact OR larger & equal
                if (gt(version, minVersion)) {
                    minVersion = version;
                }
                break;
            case '<':
            case '<=': // Smaller OR smaller & equal
                // Ignore maximum versions
                break;
            default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
        }
    }

    if (minVersion && range.test(minVersion)) {
        return minVersion;
    }

    return null;
};

module.exports = minVersion;
