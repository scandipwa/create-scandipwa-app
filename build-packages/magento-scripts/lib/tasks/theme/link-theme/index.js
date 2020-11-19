/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const { pathExists } = require('fs-extra');
const themeSymlink = require('./theme-symlink');
const installTheme = require('./install-theme');
const themeSubtask = require('./theme-subtask');
const upgradeMagento = require('./upgrade-magento');
const disablePageCache = require('./disable-page-cache');
const { getCachedPorts } = require('../../util/ports');

const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath);

    if (!composerExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(composerPath, 'utf-8'));
};

const linkTheme = {
    title: 'Linking theme',
    task: async (ctx, task) => {
        const { themePath } = ctx;
        task.output = 'Checking theme folder';

        const absoluteThemePath = path.join(process.cwd(), themePath);

        const composerData = await getComposerData(path.join(absoluteThemePath, 'composer.json'));

        if (!composerData) {
            throw new Error(`composer.json file not found in "${themePath}"`);
        }

        return task.newListr([
            themeSymlink,
            getCachedPorts,
            themeSubtask,
            installTheme,
            upgradeMagento,
            disablePageCache
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            },
            ctx
        });
    },
    options: {
        bottomBar: 5
    }
};

module.exports = linkTheme;
