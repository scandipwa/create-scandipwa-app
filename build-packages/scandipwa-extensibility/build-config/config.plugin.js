const injectBabelConfig = require('./util/babel');
const injectWebpackConfig = require('./util/webpack');

module.exports = {
    plugin: {
        overrideCracoConfig: ({ cracoConfig }) => {
            injectBabelConfig(cracoConfig.babel);

            return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig }) => injectWebpackConfig(webpackConfig)
    }
};
