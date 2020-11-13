const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');

const openBrowser = async (ports) => {
    const url = `http://localhost:${ ports.app }`;
    await execCommandAsync(`xdg-open ${ url }`);
};

module.exports = openBrowser;
