import generateMiddlewaredFunction from '../middleware/function';
import getPluginsFromConfig from '../plugins/get-plugins';

export default function generateApplyHandler(namespace) {
    return (origFunction, thisArg, originalArgs) => {
        // Get plugins for the function
        const memberPluginsApply = getPluginsFromConfig(namespace, 'function');

        // If no plugins => return the original function
        if (!memberPluginsApply.length) {
            return origFunction.apply(thisArg, originalArgs);
        }

        // Return the result of a call of a generated function (=wrapped into plugins)
        return generateMiddlewaredFunction(
            origFunction,
            memberPluginsApply,
            thisArg
        )(...originalArgs);
    };
}
