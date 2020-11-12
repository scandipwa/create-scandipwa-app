const path = require('path');

module.exports = (_, config) => {
    const { cacheDir } = config;

    return {
        dirPath: path.join(cacheDir, 'composer'),
        binPath: path.join(cacheDir, 'composer', 'composer.phar')
    };
};
