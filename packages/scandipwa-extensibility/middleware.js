const generateGetHandler = require('./lib/handlers/generateGetHandler');
const generateApplyHandler = require('./lib/handlers/generateApplyHandler');
const generateConstructHandler = require('./lib/handlers/generateConstructHandler');
const applyClassWrappers = require('./lib/middlewarers/generateMiddlewaredClass');

const addNamespaceToMiddlewarable = (Middlewarable, namespace) => {
    // Retrieve already existing namespaces
    // Prevent mutating the namespaces of parent object
    const namespaces = Object.assign(
        [],
        Reflect.get(Middlewarable.prototype, '__namespaces__')
    );

    // Prevent duplicate namespaces for overridden classes
    if (!namespaces.includes(namespace)) {
        namespaces.push(namespace);
    }

    // Set the namespaces for class
    Middlewarable.prototype.__namespaces__ = namespaces;
};

const getNamespacesFromMiddlewarable = (Middlewarable) => Middlewarable.prototype.__namespaces__;

/**
 * Middleware function is supposed to wrap source classes
 * in order to provide plugin functionality
 * @param {Function} Middlewarable
 * @param {string} namespace
 */
function middleware(Middlewarable, namespace) {
    addNamespaceToMiddlewarable(Middlewarable, namespace);

    const handler = {
        // Get handler for members - intercepts `get` calls, meant for class static members
        get: generateGetHandler('class', getNamespacesFromMiddlewarable(Middlewarable)),

        // Apply handler for functions - intercepts function calls
        apply: generateApplyHandler(getNamespacesFromMiddlewarable(Middlewarable)),

        // Construct handler for classes - intercepts `new` operator calls, changes properties
        construct: generateConstructHandler(getNamespacesFromMiddlewarable(Middlewarable))
    };

    const proxy = new Proxy(Middlewarable, handler);

    // TODO check if class
    return applyClassWrappers(proxy);
}

module.exports = middleware;
