import getPluginsForClass from '../helpers/getPluginsForClass';
import getWrapperFromPlugin from '../helpers/getWrapperFromPlugin';

/**
 * Provide an opportunity to wrap proxy with additional functions.
 * @param {Function} origMember
 * @param {Array} sortedPlugins
 * @param Context origContext
 */
export default (proxy) => {
    const { __namespaces__ } = proxy.prototype;
    const namespacePluginsClass = getPluginsForClass(__namespaces__);

    // Wrap class in its `class` plugins to provide `class` API
    const wrappedClass = namespacePluginsClass.reduce(
        (acc, plugin) => getWrapperFromPlugin(plugin, proxy.name)(acc),
        proxy
    );

    return wrappedClass;
};
