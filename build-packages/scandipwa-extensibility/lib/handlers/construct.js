import getPluginsFromConfig from '../plugins/get-plugins';
import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';

export default function generateConstructHandler(namespaces) {
    return (TargetClass, args, newTarget) => {
        // Get an instance
        const instance = Reflect.construct(TargetClass, args, newTarget);

        // Get all member-property plugins
        const namespacesPluginsConstruct = getPluginsFromConfig(namespaces, 'member-property');

        // Handle plugin -> property interactions
        namespacesPluginsConstruct.forEach(
            (namespacePluginsConstruct) => Object.entries(namespacePluginsConstruct).forEach(
                // Apply each plugin to the instance
                ([memberName, memberPluginsConstruct]) => {
                    // Retrieve the original member
                    const origMember = instance[memberName] || (() => {});
                    const sortedPlugins = memberPluginsConstruct;

                    // Wrap it into the plugins
                    const newMember = sortedPlugins.reduce(
                        (acc, plugin) => getWrapperFromPlugin(plugin, origMember.name)(acc, instance),
                        origMember
                    );

                    // Replace the original member with the new one, wrapped into the plugins
                    instance[memberName] = newMember;
                }
            )
        );

        // Handle construct logic
        if (instance.__construct) {
            // Call the "magic" __construct member function
            instance.__construct(...args);
        }

        // Return the processed instance
        return instance;
    };
}
