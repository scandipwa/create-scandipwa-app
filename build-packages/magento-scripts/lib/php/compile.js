/* eslint-disable no-param-reassign */
const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { php } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

const compile = {
    title: 'Compiling PHP',
    task: async (ctx, task) => {
        let phpCompileCommand = `phpbrew install -j $(nproc) ${ php.version } \
        +bz2 +bcmath +ctype +curl -intl +dom +filter +hash \
        +iconv +json +mbstring +openssl +xml +mysql \
        +pdo +soap +xmlrpc +xml +zip +fpm +gd \
        -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ \
        --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/`;

        if (os.platform() === 'linux' && os.dist.includes('Manjaro')) {
            phpCompileCommand += ' --with-libdir=lib64';
        }
        try {
            await execAsyncSpawn(
                phpCompileCommand,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            task.report(e);

            throw new Error(
                `Failed to compile the required PHP version.
                Tried compiling the PHP version ${ logger.style.misc(php.version) }.
                Use your favorite search engine to resolve the issue.
                Most probably you are missing some dependencies.
                See error details in the output above.`
            );

            // logger.note(
            //     'We would appreciate an issue on GitHub :)'
            // );
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = compile;
