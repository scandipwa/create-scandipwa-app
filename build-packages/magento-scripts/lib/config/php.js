const path = require('path');
const os = require('os');

module.exports = (app, config) => {
    const {
        php: {
            version,
            extensions
        }
    } = app;

    const { cacheDir } = config;

    const phpVersionDir = path.join(
        os.homedir(),
        '.phpbrew',
        'php',
        `php-${ version }`
    );

    return {
        binPath: path.join(phpVersionDir, 'bin', 'php'),
        iniPath: path.join(phpVersionDir, 'etc', 'php.ini'),
        fpmBinPath: path.resolve(phpVersionDir, 'sbin', 'php-fpm'),
        fpmConfPath: path.resolve(cacheDir, 'php-fpm.conf'),
        fpmPidFilePath: path.join(cacheDir, 'php-fpm.pid'),
        extensions,
        version
    };
};
