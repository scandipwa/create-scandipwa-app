import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';

export default function generateMiddlewaredFunction(origMember = () => {}, sortedPlugins, origContext) {
    return (...args) => {
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

        return newMember();
    };
}
