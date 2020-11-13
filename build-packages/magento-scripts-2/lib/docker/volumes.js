const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const config = require('../config');

const create = ({
    driver,
    opts = [],
    name
}) => {
    let command = `docker volume create ${ opts.map((opt) => `--opt ${opt}`).join(' ') } `;

    if (driver) {
        command += `--driver ${ driver }`;
    }

    return execCommandAsync(`${ command } ${ name }`);
};

const start = async () => {
    const volumeList = await execCommandAsync(
        'docker volume ls -q',
        process.cwd(),
        true
    );

    const missingVolumes = Object.values(config.docker.volumes).filter(
        ({ name }) => !volumeList.includes(name)
    );

    if (missingVolumes.length <= 0) {
        return;
    }

    await Promise.all([
        missingVolumes.map((volume) => create(volume))
    ]);
};

const stop = async () => {

};

module.exports = {
    start,
    stop
};
