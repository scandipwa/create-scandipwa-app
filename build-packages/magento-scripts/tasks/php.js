/* eslint-disable no-param-reassign */
const {
    checkPHP,
    buildPHP,
    setupPHPExtensions
} = require('../lib/steps/install-php');
const { php: { requiredPHPVersion } } = require('../lib/config');

exports.installPhp = {
    title: 'Checking php',
    task: async (ctx, task) => {
        const phpOk = await checkPHP();
        if (phpOk) {
            task.title = `Using PHP version ${requiredPHPVersion}`;
            return;
        }

        task.title = `Installing PHP v${requiredPHPVersion}`;

        try {
            await buildPHP({
                output: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            task.report(e);
            throw new Error(`Error while installing PHP ${requiredPHPVersion}`);
        }

        task.title = 'Installing PHP extensions';

        try {
            await setupPHPExtensions({
                output: (t) => {
                    task.output = t;
                }
            });
            task.title = `Using PHP version ${requiredPHPVersion}`;
        } catch (e) {
            task.report(e);
            throw new Error('Error while installing PHP extensions');
        }
    },
    options: {
        bottomBar: 10
    }
};
