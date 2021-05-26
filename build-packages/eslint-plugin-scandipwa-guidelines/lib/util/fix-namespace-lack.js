const getLeadingCommentsForNode = require('./get-leading-comments');


const isEslintNextLineComment = comment => comment.value.includes('eslint-disable-next-line');

/**
 * Returns true for block comments that aren't eslint-disable comments, and don't include a @license tag
 */
const isLicenseComment = (comment) => comment.value.includes('@license');

const createNamespaceComment = (namespace) => `/** @namespace ${ namespace } */\n`;

const isInParentheses = (node, context) => {
    return context.getSourceCode().text[node.loc.start - 1] === '(';
}

/**
 * Insert namespace decorator comment before the appropriate node
 * @param {Fixer} fixer
 * @param {Node} node
 * @param {Context} context
 * @param {string} namespace
 */
module.exports = (fixer, node, context, namespace) => {
    const sourceCode = context.getSourceCode();
    const leadingComments = getLeadingCommentsForNode(node, sourceCode).reverse();

    const regularBlockComment = leadingComments.find(comment => {
        if (comment.type !== 'Block') return false;
        return !isLicenseComment(comment) && !isEslintNextLineComment(comment)
    });

    if (regularBlockComment) {
        return fixer.replaceText(
            regularBlockComment,
            '/*' + regularBlockComment.value.concat(`* @namespace ${ namespace }`) + '\n */',
        );
    }

    const eslintComment = leadingComments.find(isEslintNextLineComment);

    const comment = createNamespaceComment(namespace);

    if (eslintComment) {
        return fixer.insertTextBefore(eslintComment, comment);
    }

    return fixer.insertTextBefore(
        node,
        `${ isInParentheses(node, context) ? '\n' : '' }${ comment }`,
    );
};
