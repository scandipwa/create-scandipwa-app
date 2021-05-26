const getLeadingCommentsForNode = require('./get-leading-comments');

/**
 * Insert namespace decorator comment before the appropriate node
 * @param {Fixer} fixer
 * @param {Node} node
 * @param {Context} context
 * @param {string} namespace
 */
module.exports = (fixer, node, context, namespace) => {
    const sourceCode = context.getSourceCode();
    const leadingComments = getLeadingCommentsForNode(node, sourceCode);

    if (leadingComments.find(comment => comment.value.includes('@namespace'))) {
        throw new Error("Could not add namespace: node already has a namespace comment")
    }

    const blockComment = leadingComments.reverse().find(
        comment => comment.type === 'Block' && !['eslint-disable-next-line', '@license'].some(cond => comment.value.includes(cond))
    );

    const eslintComment = leadingComments.find(
        comment => comment.value.includes('eslint-disable-next-line')
    );

    if (blockComment) {
        return fixer.replaceText(
            blockComment,
            '/*' + blockComment.value.concat(`* @namespace ${namespace}`) + '\n */'
        );
    }

    if (eslintComment) {
        return fixer.insertTextBefore(eslintComment, `/** @namespace ${namespace} */\n`);
    }

    return fixer.insertTextBefore(
        node,
        `${
            context.getSourceCode().text[node.loc.start - 1] === '(' ? '\n' : ''
        }/** @namespace ${namespace} */\n`
    );
}
