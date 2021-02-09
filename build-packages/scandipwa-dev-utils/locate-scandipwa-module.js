/* eslint-disable no-use-before-define */
const fs = require('fs');
const path = require('path');

const DEFAULT_MAX_LEVEL = 5;

/**
 * Invoke another iteration
 * @param {string} dir
 * @param {number} maxLevel
 * @param {number} level
 */
function bubbleUp(dir, maxLevel, level) {
    const parentDir = path.resolve(dir, '..');

    return locateScandipwaModule(parentDir, maxLevel, level + 1);
}

// TODO memoize
/**
 * Look for the scandipwa module above the given path
 * Bubble up up to <maxLevel> directories from the given path
 * @param {string} dir
 * @param {number} maxLevel
 * @param {number} level
 * @returns {string|null}
 */
function locateScandipwaModule(
    dir,
    maxLevel = DEFAULT_MAX_LEVEL,
    level = 1
) {
    const packageJsonPath = path.join(dir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        // Handle max recursion depth
        if (level === maxLevel) {
            return null;
        }

        // Handle no package.json -> look above
        return bubbleUp(dir, maxLevel, level);
    }

    // Read the package's package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Any scandipwa package apart from CMA -> valid
    if (packageJson.scandipwa && packageJson.scandipwa.type !== 'magento') {
        return dir;
    }

    // Handle non-scandipwa package inside of scandipwa package
    return bubbleUp(dir, maxLevel, level);
}

module.exports = locateScandipwaModule;
