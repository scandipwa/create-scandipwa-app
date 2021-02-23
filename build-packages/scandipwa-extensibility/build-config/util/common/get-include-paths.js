const extensions = require('@scandipwa/scandipwa-dev-utils/extensions');
const safePath = require('./safe-path');

const getIncludePaths = () => [
    ...extensions.map(({ packagePath }) => packagePath),
    ...extensions.map(({ packageName }) => safePath(packageName)),
    ...extensions.map(({ packageName }) => packageName)
];

module.exports = getIncludePaths;
