module.exports = {
    meta: {
        docs: {
            description:
                'Always provide both mapStateToProps and mapDispatchToProps even if they are empty for plugins',
            category: 'Extensibility',
            recommended: true,
        },
    },

    create: (context) => ({
        ['ExportDefaultDeclaration[declaration.type="CallExpression"][declaration.callee.callee.name="connect"]'](
            node
        ) {
            const { declaration } = node;
            const { arguments: args } = declaration.callee;

            // Handle valid code
            if (
                args.length === 2 &&
                !args.find(
                    (one) => one.name === 'undefined' || one.raw === 'null'
                )
            ) {
                return;
            }

            context.report({
                node,
                message: 'Provide both mapStateToProps and mapDispatchToProps even if they are empty',
            });
        },
    }),
};
