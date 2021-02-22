import pluginStorage from './plugin-storage';

/**
 * Query plugins for config
 * Use namespaces and target specifier to get block of all plugins of specifier type
 * Add member name to the params to get plugins for a specific member
 *
 * @param {string[]} namespaces
 * @param {string} targetSpecifier
 * @param {string|undefined} memberName
 * @param {object} plugins
 */
export default function getPluginsFromConfig(namespaces, targetSpecifier, memberName) {
    return namespaces.reduce(
        (acc, namespace) => {
        // Handle no member name: return all plugins for the provided section
            if (!memberName) {
                try {
                    const pluginsOfType = pluginStorage.plugins[namespace][targetSpecifier];

                    if (pluginsOfType) {
                        return acc.concat(pluginsOfType);
                    }
                } catch (e) {
                    // ignore the error
                }
            } else {
                try {
                    // Handle member name present
                    const { value } = Object.getOwnPropertyDescriptor(
                        pluginStorage.plugins[namespace][targetSpecifier] || {},
                        memberName
                    ) || {};

                    if (value) {
                        return acc.concat(value);
                    }
                } catch (e) {
                    // ignore the error
                }
            }

            return acc;
        }, []
    );
}
