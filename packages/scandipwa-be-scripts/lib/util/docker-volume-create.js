const { execAsync } = require('./exec-async-command');

/**
 * Run docker volume create command
 * @param {Object} options
 * @param {Array<String>} options.opts
 * @param {String} options.driver
 * @param {String} options.name
 */
const dockerVolumeCreate = async (options) => {
    const {
        driver,
        opts = [],
        name
    } = options;

    const driverArg = driver && `--driver ${ driver }`;
    const optsArg = opts.map((opt) => `--opt ${opt}`).join(' ');

    return execAsync(['docker', 'volume', 'create', driverArg, optsArg, name].filter(Boolean).join(' '));
};

module.exports = dockerVolumeCreate;
