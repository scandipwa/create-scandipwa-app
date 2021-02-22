const path = require('path');
const { whenDev } = require('@scandipwa/craco');
const escapeRegex = require('@scandipwa/scandipwa-dev-utils/escape-regex');

const supportLegacy = (webpackConfig) => {
    // support legacy, non stealthy extensions, stripout the Util/Extensions import
    webpackConfig.module.rules.push({
        test: new RegExp(escapeRegex(path.join('util', 'Extensions', 'index.js'))),
        loader: whenDev(() => 'null-loader', 'noop-loader')
    });

    return webpackConfig;
};

module.exports = supportLegacy;
