const { pathExists } = require('fs-extra');
const fs = require('fs');
const path = require('path');
const { config } = require('../../config');

const magentoFiles = [
    '.editorconfig',
    '.htaccess',
    '.htaccess.sample',
    '.php_cs.dist',
    '.user.ini',
    'CHANGELOG.md',
    'COPYING.txt',
    'Gruntfile.js.sample',
    'LICENSE.txt',
    'LICENSE_AFL.txt',
    'SECURITY.md',
    'app',
    'auth.json.sample',
    'bin',
    'composer.json',
    'composer.lock',
    'dev',
    'generated',
    'grunt-config.json.sample',
    'index.php',
    'lib',
    'nginx.conf.sample',
    'package.json.sample',
    'phpserver',
    'pub',
    'setup',
    'var',
    'vendor'
];

const removeMagento = {
    title: 'Remove magento application folder',
    task: async (ctx, task) => {
        const appPathExists = await pathExists(config.magentoDir);

        if (appPathExists && ctx.force) {
            await Promise.all(magentoFiles.map(async (fileName) => {
                const filePath = path.join(config.magentoDir, fileName);
                const file = await fs.promises.stat(filePath);
                if (file.isFile()) {
                    await fs.promises.unlink(filePath);
                } else if (file.isDirectory()) {
                    await fs.promises.rmdir(filePath, { recursive: true });
                }
            }));

            return;
        }

        task.skip();
    }
};

module.exports = removeMagento;
