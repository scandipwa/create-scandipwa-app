/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync, execAsyncSpawn } = require('../util/exec-async-command');
const {
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    }
} = require('../config');
const osPlatform = require('../util/os-platform');
const pathExists = require('../util/path-exists');

const checkPHP = async () => pathExists(phpBinPath);

const setupPHPExtensions = async ({ output }) => {
    try {
        const loadedPHPModules = await execAsync(`${phpBinPath} -m`);
        // console.log(loadedPHPModules)
        const missingPHPExtensions = phpExtensions.filter((ext) => !loadedPHPModules.includes(ext.name));
        if (missingPHPExtensions.length > 0) {
            for (const extension of missingPHPExtensions) {
                output(`Installing PHP extension ${extension.name}...${extension.options ? ` with options "${extension.options}"` : ''}`);
                // eslint-disable-next-line max-len
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && phpbrew use ${requiredPHPVersion} && phpbrew ext install ${extension.name}${extension.options ? ` -- ${extension.options}` : ''}`,
                    {
                        callback: (line) => {
                            if (line.includes('Configuring')) {
                                logger.log(`Configuring PHP extension ${extension.name}...`);
                            }
                            if (line.includes('Building')) {
                                logger.log(`Building PHP extension ${extension.name}...`);
                            }
                            if (line.includes('Running make install')) {
                                logger.log(`Installing PHP extension ${extension.name}...`);
                            }
                        }
                    });
                output(`PHP extension ${extension.name} installed!`);
            }

            output('PHP extensions are installed!');
        }
    } catch (e) {
        output(
            'Unexpected error while setting up PHP extensions.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const buildPHP = async ({ output }) => {
    try {
        await execAsyncSpawn('phpbrew -v');
    } catch (e) {
        if (/phpbrew: command not found/.test(e.message)) {
            throw new Error(`Package ${ logger.style.misc('phpbrew') } is not installed!.\nTo install, follow this instructions: https://github.com/phpbrew/phpbrew/wiki/Quick-Start`);
        }
    }

    const os = await osPlatform();

    try {
        const PHPBrewVersions = await execAsyncSpawn('phpbrew list');

        if (!requiredPHPVersionRegex.test(PHPBrewVersions)) {
            logger.log(`Compiling and building PHP-${requiredPHPVersion}...`);
            let phpBuildCommandLinux = `phpbrew install -j $(nproc) ${ requiredPHPVersion } \
            +bz2 +bcmath +ctype +curl -intl +dom +filter +hash \
            +iconv +json +mbstring +openssl +xml +mysql \
            +pdo +soap +xmlrpc +xml +zip +fpm +gd \
            -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ \
            --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/`;

            if (os.os === 'linux' && os.dist.includes('Manjaro')) {
                phpBuildCommandLinux += ' --with-libdir=lib64';
            }

            const phpBuildCommandMac = `phpbrew install -j $(sysctl -n hw.ncpu) ${ requiredPHPVersion } \
            +bz2="$(brew --prefix bzip2)" +bcmath +ctype +curl -intl +dom +filter +hash \
            +iconv="$(brew --prefix libiconv)" +json +mbstring +openssl="$(brew --prefix openssl)" +xml +mysql \
            +pdo +soap +xmlrpc +xml +zip +fpm +gd \
            --  --with-gd=$(brew --prefix gd) \
            --with-png-dir=$(brew --prefix libpng) \
            --with-zlib-dir=$(brew --prefix zlib) \
            --with-jpeg-dir=$(brew --prefix jpeg) \
            --with-xpmlib-dir=$(brew --prefix libxpm) \
            --with-freetype-dir=$(brew --prefix freetype) \
            --with-iconv-dir=$(brew --prefix libiconv)`;

            await execAsyncSpawn(
                os.os === 'linux' ? phpBuildCommandLinux : phpBuildCommandMac,
                {
                    callback: output
                }
            );
        }
    } catch (e) {
        output(
            'Unexpected error while compiling and building PHP.',
            'See ERROR log above.'
        );

        throw e;
    }
};

const installPHP = async () => {
    logger.log('Checking PHP...');

    const hasPHPInGlobalCache = await checkPHP();

    if (!hasPHPInGlobalCache) {
        logger.warn(`Required PHP version ${requiredPHPVersion} not found in cache, starting build...`);
        logger.log('This operation can take some time');
        const buildPHPOk = await buildPHP();
        if (!buildPHPOk) {
            return false;
        }
    } else {
        logger.log(`Using PHP version ${requiredPHPVersion}`);
    }

    const extensionsOK = await setupPHPExtensions();

    if (!extensionsOK) {
        return false;
    }

    return true;
};

module.exports = {
    installPHP, checkPHP, buildPHP, setupPHPExtensions
};
