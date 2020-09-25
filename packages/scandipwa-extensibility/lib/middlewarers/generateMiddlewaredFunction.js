const getWrapperFromPlugin = require('../helpers/getWrapperFromPlugin');

/**
 * Middlewaring given original member
 * @param {Function} origMember
 * @param {Array} sortedPlugins
 * @param Context origContext
 */
module.exports = (origMember = () => {}, sortedPlugins, origContext) => function (...args) {
    const newMember = sortedPlugins.reduce(
        (acc, plugin) => () => {
            const wrapper = getWrapperFromPlugin(plugin, origMember.name);

            // Provide different arguments due to API difference
            // Between property and function call interception
            return typeof origMember === 'object'
                ? wrapper(acc, origContext)
                : wrapper(
                    args,
                    acc.bind(origContext),
                    origContext
                );
        },
        origMember
    );

    return newMember(args);
};
