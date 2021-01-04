const getLeadingCommentsForNode = require('../util/get-leading-comments');

/**
 * @fileoverview All components should be extensible.
 * @author Jegors Batovs
 */
'use strict';

const hasNamespace = (node, context) => {
	const nodeToProcess = node.parent.type === 'ExportNamedDeclaration'
		? node.parent
		: node;

    const leadingComments = getLeadingCommentsForNode(nodeToProcess, context.getSourceCode());

    const namespaceComment = leadingComments.find(
		({ value }) => value.match(/@namespace/)
	);

	return !!namespaceComment;
};

module.exports = {
    meta: {
        docs: {
            description:
                'Use __construct(...) magic method instead of JS default constructor(...)',
            category: 'Coding standard',
            recommended: true,
        },
        fixable: 'code',
    },

    create: (context) => ({
        MethodDefinition(node) {
            if (node.key.name === 'constructor' && hasNamespace(node.parent.parent, context)) {
                context.report({
                    node,
                    message: 'Declaring `constructor` on classes is prohibited! Use `__construct` with same semantics instead.',
                    fix: (fixer) => {
                        const superNode = node.value.body.body.find(
                            (node) => {
                                return node.type === 'ExpressionStatement'
                                    && node.expression
                                    && node.expression.type === 'CallExpression'
                                    && node.expression.callee
                                    && node.expression.callee.type === 'Super'
                            }
                        );

                        const fixes = [fixer.replaceText(node.key, '__construct')]
                        if (superNode) {
							fixes.push(fixer.replaceText(superNode, `super.__construct(${
								superNode.expression.arguments.map(arg => arg.name).join(', ')
							});`))
						}

                        return fixes;
                    }
                });
            }
        },
        ClassProperty(node) {
            if (node.key.name === '__construct') {
                context.report({
                    node,
                    message: 'Binding __construct is prohibited!',
                });
            }
        },
    }),
};
