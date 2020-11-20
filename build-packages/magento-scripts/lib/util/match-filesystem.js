const { pathExists } = require('fs-extra');
const path = require('path');

/**
 * Check file system structure to detect possible unfinished installation
 * @param {String} cwd working directory
 * @param {Object} structure Object with template files structure
 */
const matchFilesystem = async (cwd, structure) => {
    if (Array.isArray(structure)) {
        const ok = (await Promise.all(structure.map((str) => pathExists(path.join(cwd, str)))))
            .every((value) => value === true);

        return ok;
    } if (typeof structure === 'object') {
        const ok = (await Promise.all(Object.entries(structure).map(([key, value]) => {
            if (typeof value === 'boolean') {
                return pathExists(path.join(cwd, key));
            }

            return matchFilesystem(path.join(cwd, key), value);
        })))
            .every((value) => value === true);

        return ok;
    }

    return pathExists(path.join(cwd, structure));
};

module.exports = matchFilesystem;
