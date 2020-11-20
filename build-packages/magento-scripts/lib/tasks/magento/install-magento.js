/* eslint-disable no-param-reassign */
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const runComposerCommand = require('../../util/run-composer');
const matchFilesystem = require('../../util/match-filesystem');

const installMagento = {
    title: 'Installing Magento',
    task: async ({ magentoVersion, config: { config } }, task) => {
        const isFsMatching = await matchFilesystem(config.magentoDir, {
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

        task.title = 'Creating Magento project...';
        const tempDir = path.join(os.tmpdir(), `magento-tmpdir-${Date.now()}`);
        await runComposerCommand(
            `create-project \
        --repository=https://repo.magento.com/ magento/project-community-edition=${magentoVersion} \
        --no-install \
        "${tempDir}"`,
            { magentoVersion }
        );

        await execAsyncSpawn(`mv ${path.join(tempDir, 'composer.json')} ${process.cwd()}`);

        await fs.promises.rmdir(tempDir);

        await runComposerCommand('install',
            {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });

        task.title = 'Magento installed!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
