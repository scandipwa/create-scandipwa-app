const traverse = require("./eslint-traverse");

function getIdentifierOccurrences(context, actualClassName) {
    const nodes = [];

    traverse(
        context.getSourceCode().ast,
        ({ node }) => {
            if (
                node.type !== 'Identifier'
                || node.name !== actualClassName
                || (node.parent && node.parent.type === 'ImportSpecifier')
            ) {
                return;
            }

            nodes.push(node);
        },
    );

    return nodes;
}

module.exports = {
    getIdentifierOccurrences,
};
