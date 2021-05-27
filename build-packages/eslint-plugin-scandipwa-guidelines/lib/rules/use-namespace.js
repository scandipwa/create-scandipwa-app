/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

const { constructMessage } = require('../util/messages.js');
const {
    getNodeDescription,
    getActualNamespace,
    getExpectedNamespace,
    getNamespaceCommentForNode,
    getProperParentNode, NAMESPACEABLE_NODE,
} = require('../util/namespace.js');

const {
    insertNamespaceFix,
    createNamespaceComment,
} = require('../util/fix-namespace-lack.js');

const DOCUMENTATION_LINK =
    "https://github.com/scandipwa/eslint/blob/master/docs/rules/use-namespace.js";


function getWrongNamespaceMessage(itemIdentifier, expectedNamespace, actualNamespace) {
    const error = `The namespace for this ${itemIdentifier} is incorrect.`;
    const help = `To fix this error, change the namespace from ${ actualNamespace } to ${ expectedNamespace }.`;

    return constructMessage(error, help, DOCUMENTATION_LINK);
}

function getMissingNamespaceMessage(itemIdentifier, expectedNamespace) {
    const error = `This ${itemIdentifier} should have a namespace specified but does not.`;
    const expectedComment = createNamespaceComment(expectedNamespace);
    const help = `To fix this error, add a namespace: ${ expectedComment }`;

    return constructMessage(error, help, DOCUMENTATION_LINK);
}

module.exports = {
    meta: {
        docs: {
            description: 'Use @namespace comment-decorators',
            category: 'Extensibility',
            recommended: true,
            url: DOCUMENTATION_LINK,
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
                    message: getMissingNamespaceMessage(getNodeDescription(node), expectedNamespace),
                    fix: fixer => insertNamespaceFix(
                        fixer,
                        getProperParentNode(node),
                        context,
                        expectedNamespace,
                    ) || [],
                });
            } else if (expectedNamespace !== namespaceCommentString) {
                context.report({
                    node,
                    message: getWrongNamespaceMessage(getNodeDescription(node), expectedNamespace, actualNamespace),
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
