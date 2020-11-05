import getPluginsForMember from '../helpers/getPluginsForMember';
import generateMiddlewaredFunction from '../middlewarers/generateMiddlewaredFunction';

export default (namespace) => (origFunction, thisArg, originalArgs) => {
    // Get plugins for the function
    const memberPluginsApply = getPluginsForMember(namespace, 'function');

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
