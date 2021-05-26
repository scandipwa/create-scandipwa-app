/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

const {
    getNodeDescription,
    getActualNamespace,
    getExpectedNamespace,
    getNamespaceCommentForNode,
    getProperParentNode, NAMESPACEABLE_NODE,
} = require('../util/namespace.js');

const fixNamespaceLack = require('../util/fix-namespace-lack.js');

module.exports = {
    meta: {
        docs: {
            description: 'Use @namespace comment-decorators',
            category: 'Extensibility',
            recommended: true,
        },
        fixable: 'code',
    },

    create: context => ({
        [NAMESPACEABLE_NODE]: (node) => {
            const namespaceComment = getNamespaceCommentForNode(node, context.getSourceCode()) || { value: '' };
            const namespaceCommentString = namespaceComment.value.split('@namespace').pop().trim();

            const actualNamespace = getActualNamespace(namespaceComment);
            const expectedNamespace = getExpectedNamespace(node, context);

            if (!namespaceCommentString) {
                context.report({
                    node,
                    message: `Provide namespace for ${ getNodeDescription(node) } by using @namespace magic comment`,
                    fix: fixer => fixNamespaceLack(
                        fixer,
                        getProperParentNode(node),
                        context,
                        expectedNamespace,
                    ) || [],
                });
            } else if (expectedNamespace !== namespaceCommentString) {
                context.report({
                    node,
                    message: `Namespace for this node is not valid! Consider changing it to ${ expectedNamespace }`,
                    fix: fixer => {
                        const newNamespaceCommentContent = namespaceComment.value.replace(actualNamespace, expectedNamespace);
                        const newNamespaceComment = namespaceComment.type === 'Block'
                            ? `/*${ newNamespaceCommentContent }*/`
                            : `// ${ newNamespaceCommentContent }`;

                        return fixer.replaceText(
                            namespaceComment,
                            newNamespaceComment,
                        )
                    },
                });
            }
        },
    }),
};
