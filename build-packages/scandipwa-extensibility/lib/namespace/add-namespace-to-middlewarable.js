export default function addNamespaceToMiddlewarable(Middlewarable, namespace) {
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
    // eslint-disable-next-line no-param-reassign
    Middlewarable.prototype.__namespaces__ = namespaces;
}
