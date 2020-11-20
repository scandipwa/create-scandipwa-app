const { execAsyncSpawn } = require('../../util/exec-async-command');

const create = ({
    driver,
    opts = [],
    name
}) => {
    let command = `docker volume create ${ opts.map((opt) => `--opt ${opt}`).join(' ') } `;

    if (driver) {
        command += `--driver ${ driver }`;
    }

    return execAsyncSpawn(`${ command } ${ name }`);
};

const createVolumes = {
    title: 'Creating volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = await execAsyncSpawn('docker volume ls -q');

        const missingVolumes = Object.values(docker.volumes).filter(
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
    task: async ({ config: { docker } }, task) => {
        const volumeList = await execAsyncSpawn('docker volume ls -q');

        const deployedVolumes = Object.values(docker.volumes).filter(
            ({ name }) => volumeList.includes(name)
        );

        if (deployedVolumes.length === 0) {
            task.skip();
            return;
        }

        await execAsyncSpawn(`docker volume rm ${deployedVolumes.map(({ name }) => name).join(' ')}`);
    }
};

module.exports = {
    createVolumes,
    removeVolumes
};
