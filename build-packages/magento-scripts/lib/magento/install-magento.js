/* eslint-disable no-param-reassign */
const { pathExists } = require('fs-extra');
const path = require('path');
const {
    config: { magentoDir },
    php: { binPath: phpBinPath },
    composer: { binPath: composerBinPath },
    magento: { version: magentoVersion }
} = require('../config');
const { execAsyncSpawn } = require('../../util/exec-async-command');

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

const installMagento = {
    title: 'Installing Magento',
    task: async (ctx, task) => {
        const isFsMatching = await matchFilesystem(magentoDir, {
            design: true,
            'app/etc': [
                'env.php'
            ],
            'bin/magento': true,
            'composer.json': true,
            'composer.lock': true
        });

        if (isFsMatching) {
            task.skip();
            return;
        }

        const appDirExists = await pathExists(magentoDir);

        if (appDirExists) {
            throw new Error(`App directory exists but magento is not installed.

            This can happen if installation was aborted by error or by user.
            To fix that we suggest to run command npm run cleanup --force which will fully remove src directory.`);
        }

        task.title = 'Creating Magento project...';
        await execAsyncSpawn(
            `${phpBinPath} ${composerBinPath} create-project \
        --repository=https://repo.magento.com/ \
        magento/project-community-edition=${magentoVersion} \
        src`,
            {
                callback: (t) => {
                    task.output = t;
                }
            }
        );
        task.title = 'Magento installed!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
