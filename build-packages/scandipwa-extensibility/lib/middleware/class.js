import getNamespacesFromMiddlewarable from '../namespace/get-namespaces-from-middlewarable';
import getPluginsForClass from '../plugins/get-plugins-for-class';
import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';

export default function generateMiddlewaredClass(proxy, plugins) {
    const __namespaces__ = getNamespacesFromMiddlewarable(proxy);
    const namespacePluginsClass = getPluginsForClass(__namespaces__, plugins);

    // Wrap class in its `class` plugins to provide `class` API
    const wrappedClass = namespacePluginsClass.reduce(
        (acc, plugin) => getWrapperFromPlugin(plugin, proxy.name)(acc),
        proxy
    );

    return wrappedClass;
}
