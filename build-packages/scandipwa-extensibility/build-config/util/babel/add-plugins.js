const addBabelPlugins = (babelConfig) => {
    // It's important that these plugins go before all of the other ones
    babelConfig.plugins.unshift(

        // Enable 3.x middleware decorators!
        require.resolve('@scandipwa/scandipwa-extensibility/build-config/babel-plugin-middleware-decorator'),

        // Required for the plugin system to work
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-async-to-generator'
    );

    return babelConfig;
};

module.exports = addBabelPlugins;
