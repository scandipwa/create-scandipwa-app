export default function getNamespacesFromMiddlewarable(Middlewarable) {
    return Middlewarable.prototype.__namespaces__;
}
