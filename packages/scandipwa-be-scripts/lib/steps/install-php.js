/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsync, execAsyncSpawn } = require('../util/exec-async-command');
const ora = require('ora');
const path = require('path');
const {
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    },
    templatePath,
    php
} = require('../config');
const osPlatform = require('../util/os-platform');
const checkConfigPath = require('../util/check-config');

const checkPHPInGlobalCache = async () => {
    try {
        await execAsync(`ls ${phpBinPath}`);
        return true;
    } catch (e) {
        return false;
    }
};

const setupPHPExtensions = async ({ output }) => {
    try {
        const loadedPHPModules = await execAsync(`${phpBinPath} -m`);
        // console.log(loadedPHPModules)
        const missingPHPExtensions = phpExtensions.filter((ext) => !loadedPHPModules.includes(ext.name));
        if (missingPHPExtensions.length > 0) {
            for (const extension of missingPHPExtensions) {
                output.start(`Installing PHP extension ${extension.name}...${extension.options ? ` with options "${extension.options}"` : ''}`);
                // eslint-disable-next-line max-len
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && phpbrew use ${requiredPHPVersion} && phpbrew ext install ${extension.name}${extension.options ? ` -- ${extension.options}` : ''}`,
                    {
                        callback: (line) => {
                            if (line.includes('Configuring')) {
                                output.text = `Configuring PHP extension ${extension.name}...`;
                            }
                            if (line.includes('Building')) {
                                output.text = `Building PHP extension ${extension.name}...`;
                            }
                            if (line.includes('Running make install')) {
                                output.text = `Installing PHP extension ${extension.name}...`;
                            }
                        }
                    });
                output.succeed(`PHP extension ${extension.name} installed!`);
            }

            output.succeed('PHP extensions are installed!');
        }

        return true;
    } catch (e) {
        output.fail(e.message);

        logger.error(e);

        logger.error(
            'Unexpected error while setting up PHP extensions.',
            'See ERROR log above.'
        );

        return false;
    }
};

const buildPHP = async ({ output }) => {
    try {
        await execAsyncSpawn('phpbrew -v');
    } catch (e) {
        if (/phpbrew: command not found/.test(e.message)) {
            output.fail(`Package ${ logger.style.misc('phpbrew') } is not installed!.\nTo install, follow this instructions: https://github.com/phpbrew/phpbrew/wiki/Quick-Start`);

            return false;
        }
    }

    const os = await osPlatform();

    try {
        const PHPBrewVersions = await execAsyncSpawn('phpbrew list');

        if (!requiredPHPVersionRegex.test(PHPBrewVersions)) {
            output.start(`Compiling and building PHP-${requiredPHPVersion}...`);
            await execAsyncSpawn(
                `phpbrew install -j $(nproc) ${ requiredPHPVersion } \
                +bz2 +bcmath +ctype +curl -intl +dom +filter +hash \
                +iconv +json +mbstring +openssl +xml +mysql \
                +pdo +soap +xmlrpc +xml +zip +fpm +gd \
                -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ \
                --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/ ${os.dist.includes('Manjaro') ? '--with-libdir=lib64' : ''}`,
                {
                    callback: (line) => {
                        if (line.includes('Configuring')) {
                            output.text = `Configuring PHP-${requiredPHPVersion}...`;
                        }
                        if (line.includes('Building...')) {
                            output.text = `Building PHP-${requiredPHPVersion}...`;
                        }
                        if (line.includes('Installing...')) {
                            output.text = `Installing PHP-${requiredPHPVersion}...`;
                        }
                    }
                }
            );
        }
        output.succeed('PHP compiled successfully!');
    } catch (e) {
        output.fail(e.message);

        logger.error(e);
        logger.error(
            'Unexpected error while compiling and building PHP.',
            'See ERROR log above.'
        );

        return false;
    }

    const phpConfigOk = await checkConfigPath({
        configPathname: php.phpIniPath,
        template: path.join(templatePath, 'php.template.ini'),
        name: 'PHP',
        output,
        overwrite: true
    });

    if (!phpConfigOk) {
        return false;
    }

    return true;
};

const installPHP = async () => {
    const output = ora('Checking PHP...').start();

    const hasPHPInGlobalCache = await checkPHPInGlobalCache();

    if (!hasPHPInGlobalCache) {
        output.warn(`Required PHP version ${requiredPHPVersion} not found in cache, starting build...`);
        output.info('This operation can take some time');
        const buildPHPOk = await buildPHP({ output });
        if (!buildPHPOk) {
            return false;
        }
    } else {
        output.succeed(`Using PHP version ${requiredPHPVersion}`);
    }

    const extensionsOK = await setupPHPExtensions({ output });

    if (!extensionsOK) {
        output.stop();
        return false;
    }

    output.stop();

    return true;
};

module.exports = installPHP;
