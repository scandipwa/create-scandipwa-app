const { execAsync } = require("./lib/util/exec-async");
const config = require('./lib/config');
const ora = require("ora");
const logger = require("@scandipwa/scandipwa-dev-utils/logger");
const getRunningContainers = require("./lib/util/get-running-containers");


async function shutdown () {
    const runningContainers = await getRunningContainers()
    if (runningContainers.length === 0) {
        ora('No running containers found. Terminating process...').warn()

        return true
    }
    const output = ora('Stopping containers...').start()

    const containersToStop = config.docker.containerList
        .filter(container => runningContainers.some(runningContainer => runningContainer.includes(container().name)))
        .map(container => container().name)

    try {
        await execAsync(`docker container stop ${containersToStop.join(' ')}`)
        output.succeed('Containers stopped successfully!')
    } catch (e) {
        output.fail(e.message)

        logger.error(e)
        logger.error(
            'Unexpected error while stopping docker containers',
            'See ERROR log above.'
        );
    }
}

shutdown()