/**
 * Get package JSON, or empty object
 *
 * @param {string} pathname
 * @return {object} 
 */
const getPackageJson = (pathname) => {
    try {
        return require(path.join(pathname, 'package.json')) || {};
    } catch (e) {
        return {};
    }
};

module.exports = {
    getPackageJson
};