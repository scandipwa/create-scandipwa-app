const fs = require('fs');
const path = require('path');
const memFs = require("mem-fs");
const https = require('https');
const semver = require('semver');
const spawn = require('cross-spawn');
const editor = require('mem-fs-editor');
const greet = require('@scandipwa/scandipwa-dev-utils/greet');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn');

const DEFAULT_PROXY = 'http://scandipwapmrev.indvp.com';

const getLatestVersion = (package) => {
    return new Promise((resolve, reject) => {
        https
            .get(
                `https://registry.npmjs.org/-/package/${package}/dist-tags`,
                res => {
                    if (res.statusCode === 200) {
                        let body = '';
                        res.on('data', data => (body += data));
                        res.on('end', () => {
                            resolve(JSON.parse(body).latest);
                        });
                    } else {
                        reject();
                    }
                }
            )
            .on('error', () => {
                reject();
            });
    });
}

const createAppFiles = async ({
    name,
    path: destPath,
    template
}) => {
    const templateOptions = {
        scandipwaVersion: await getLatestVersion('@scandipwa/scandipwa'),
        scandipwaScriptsVersion: await getLatestVersion('@scandipwa/scandipwa-scripts'),
        name,
        proxy: DEFAULT_PROXY
    };

    const store = memFs.create();
    const filesystem = editor.create(store);

    const destinationPath = (pathname) => {
        // return path to dest folder
        if (!pathname) {
            return path.join(
                process.cwd(),
                destPath
            );
        }

        return path.join(
            process.cwd(),
            destPath,
            pathname
        );
    }

    const templatePath = (pathname) => {
        return path.join(
            __dirname,
            'templates',
            template,
            pathname
        );
    };

    // Create destination path
    fs.mkdirSync(destinationPath(), { recursive: true });

    filesystem.copyTpl(
        templatePath('package.json'),
        destinationPath('package.json'),
        templateOptions
    );

    filesystem.copyTpl(
        templatePath('yarn.lock.cached'),
        destinationPath('yarn.lock'),
        templateOptions
    );

    filesystem.copyTpl(
        templatePath('composer.json'),
        destinationPath('composer.json'),
        templateOptions
    );

    filesystem.copy(
        templatePath('sample.gitignore'),
        destinationPath('.gitignore')
    );

    filesystem.copyTpl(
        templatePath('magento/**/*'),
        destinationPath('magento'),
        templateOptions
    );

    filesystem.copy(
        templatePath('i18n/**/*'),
        destinationPath('i18n'),
        { globOptions: { dot: true } }
    );

    filesystem.copy(
        templatePath('public/**/*'),
        destinationPath('public'),
        { globOptions: { dot: true } }
    );

    filesystem.copy(
        templatePath('src/**/*'),
        destinationPath('src'),
        { globOptions: { dot: true } }
    );

    // return "awaited" promise
    // TODO: check for conflicts
    return new Promise((resolve) => {
        filesystem.commit([], resolve);
    });
};

const install = ({ path: destPath }) => {
    return new Promise((resolve, reject) => {
        const command = shouldUseYarn()
            ? 'yarnpkg'
            : 'npm';

        const child = spawn(
            command,
            ['install', '--cwd', destPath],
            { stdio: 'inherit' }
        );

        child.on('close', code => {
            if (code !== 0) {
                reject();
                return;
            }

            resolve();
        });
    });
};

const createApp = async (options) => {
    try {
        await createAppFiles(options);
        await install(options);
        greet(options);
    } catch (e) {
        logger.error('Something went wrong during setup. Error log bellow.');
        logger.logN(e);
    }
};

const init = (options) => {
    getLatestVersion('create-scandipwa-app')
        .catch(() => {
            try {
                return execSync('npm view create-scandipwa-app version').toString().trim();
            } catch (e) {
                return null;
            }
        })
        .then(latest => {
            const packageJson = require('./package.json');

            if (latest && semver.lt(packageJson.version, latest)) {
                logger.error(
                    `You are running ${logger.style.misc('create-scandipwa-app')} ${logger.style.misc(packageJson.version)}, which is behind the latest release ${logger.style.misc(latest)}.`,
                    'We no longer support global installation of Create ScandiPWA App.'
                );

                logger.log('Please remove any global installs with one of the following commands:');
                logger.logT('npm uninstall -g create-scandipwa-app');
                logger.logT('yarn global remove create-scandipwa-app');

                process.exit(1);
            } else {
                createApp(options);
            }
        });
}

module.exports = init;