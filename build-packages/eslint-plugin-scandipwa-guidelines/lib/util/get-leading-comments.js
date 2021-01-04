module.exports = (node, sourceCode) => {
    if (!sourceCode) {
        throw new Error('Please provide an instance of SourceCode to resolve comments for node');
    }

    // ESLint ~4
    if (typeof sourceCode.getCommentsBefore === 'function') {
        return sourceCode.getCommentsBefore(node);
    }

    // ESLint ~3.9.1
    if (typeof sourceCode.getComments === 'function') {
        const { leading } = sourceCode.getComments(node);

        return leading;
    }

    // ESLint circa 3
    if (typeof sourceCode.getLeadingComments === 'function') {
        return sourceCode.getLeadingComments(node);
    }

    throw new Error('Unable to retrieve comments for the node.');
};
