/* eslint-disable no-param-reassign */
const { pathExists } = require('fs-extra');
const {
    config: { magentoDir },
    php,
    composer,
    magento
} = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');
const matchFilesystem = require('../util/match-filesystem');

const installMagento = {
    title: 'Installing Magento',
    task: async (ctx, task) => {
        const isFsMatching = await matchFilesystem(magentoDir, {
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
            `${php.binPath} ${composer.binPath} create-project \
        --repository=https://repo.magento.com/ \
        magento/project-community-edition=${magento.version} \
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
