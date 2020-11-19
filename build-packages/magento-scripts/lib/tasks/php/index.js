/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { pathExists } = require('fs-extra');
const { execAsyncSpawn } = require('../util/exec-async-command');
const { php } = require('../config');
const compile = require('./compile');
const configure = require('./configure');

const installPhp = {
    title: 'Install PHP',
    task: async (ctx, task) => {
        const phpBinExists = await pathExists(php.binPath);

        if (phpBinExists) {
            task.title = `Using PHP version ${php.version}`;
            return;
        }

        task.title = `Installing PHP ${php.version}`;
        const versionRegex = new RegExp(php.version);

        try {
            const phpVersions = await execAsyncSpawn('phpbrew list');

            if (versionRegex.test(phpVersions)) {
                task.skip();
                return;
            }
        } catch (e) {
            task.report(e);

            throw new Error(
                `Failed to extract the list of installed PHP versions.
                Possibly, you forgot to setup PHPBrew?
                Follow these instruction: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#setting-up') }
                Otherwise, See error details in the output above.`
            );
        }

        // eslint-disable-next-line consistent-return
        return task.newListr([
            compile,
            configure
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            },
            ctx
        });
    }
};

module.exports = { installPhp };
