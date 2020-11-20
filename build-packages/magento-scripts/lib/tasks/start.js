/* eslint-disable no-param-reassign */
const { getAvailablePorts } = require('../util/ports');
const openBrowser = require('../util/open-browser');

const { installComposer } = require('./composer');
const { startServices } = require('./docker');
const { installPhp } = require('./php');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { startPhpFpm } = require('./php-fpm');
const { prepareFileSystem } = require('./file-system');
const { installMagento, setupMagento } = require('./magento');
const getMagentoVersion = require('./magento/get-magento-version');
const getAppConfig = require('../config/get-config');

const start = {
    title: 'Starting project',
    task: async (ctx, task) => task.newListr([
        createCacheFolder,
        checkRequirements,
        getAvailablePorts,
        getMagentoVersion,
        getAppConfig,
        installComposer,
        installPhp,
        prepareFileSystem,
        installMagento,
        startPhpFpm,
        startServices,
        setupMagento,
        {
            title: 'Open browser',
            task: async ({ ports }) => {
                openBrowser(`http://localhost:${ports.app}`);
            }
        }
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = start;
