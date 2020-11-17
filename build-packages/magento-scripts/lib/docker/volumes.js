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

const createVolumes = {
    title: 'Creating volumes',
    task: async (ctx, task) => {
        const volumeList = await execCommandAsync(
            'docker volume ls -q',
            process.cwd(),
            true
        );

        const missingVolumes = Object.values(config.docker.volumes).filter(
            ({ name }) => !volumeList.includes(name)
        );

        if (missingVolumes.length === 0) {
            task.skip();
            return;
        }

        await Promise.all(missingVolumes.map((volume) => create(volume)));
    }
};

const removeVolumes = {
    title: 'Removing volumes',
    task: async (ctx, task) => {
        const volumeList = await execCommandAsync(
            'docker volume ls -q',
            process.cwd(),
            true
        );

        const deployedVolumes = Object.values(config.docker.volumes).filter(
            ({ name }) => volumeList.includes(name)
        );

        if (deployedVolumes.length === 0) {
            task.skip();
            return;
        }

        await execCommandAsync(`docker volume rm ${deployedVolumes.map(({ name }) => name).join(' ')}`);
    }
};

module.exports = {
    createVolumes,
    removeVolumes
};
