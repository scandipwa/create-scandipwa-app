/* eslint-disable no-param-reassign */
const { startPhpFpm, stopPhpFpm } = require('../lib/steps/manage-php-fpm');

exports.startPhpFpmTask = {
    title: 'Start PHP-FPM',
    task: async (ctx, task) => {
        try {
            await startPhpFpm({
                output: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            task.report(e);
            throw new Error('Error during php-fpm start');
        }
    },
    options: {
        bottomBar: 5
    }
};

exports.stopPhpFpmTask = {
    title: 'Stopping php-fpm',
    task: async (ctx, task) => {
        await stopPhpFpm({
            output: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};
