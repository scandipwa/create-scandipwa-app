const { execSync } = require('child_process');

module.exports = () => {
    try {
        execSync('yarnpkg --version', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};
