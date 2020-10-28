/**
 * @fileoverview Non-extensible components are not allowed.
 * @author Jegors Batovs
 */

const CLASS_DECLARATION = 'ClassDeclaration';
const FUNCTION_DECLARATION = 'FunctionDeclaration';
const VARIABLE_DECLARATION = 'VariableDeclaration';

const shouldGetExported = [
    CLASS_DECLARATION,
    FUNCTION_DECLARATION,
    VARIABLE_DECLARATION,
];

const shouldBeExported = (node) => {
    return (
        node.type !== VARIABLE_DECLARATION ||
        !node.declarations.find((one) => one.id.type === 'ObjectPattern')
    );
};

const getName = (node) => {
    if ([CLASS_DECLARATION, FUNCTION_DECLARATION].includes(node.type)) {
        return node.id.name;
    }

    return 'This variable';
};

module.exports = {
    meta: {
        docs: {
            description:
                'Everything declared in module on the first nesting level should be exported.',
            category: 'Coding standard',
            recommended: false,
        },
        fixable: 'code',
    },

    create: (context) => ({
        Program(node) {
            const { body } = node;

            body
                .filter((levelOneNode) => shouldGetExported.includes(levelOneNode.type))
                .map((exportable) => {
                    if (shouldBeExported(exportable)) {
                        context.report({
                            node: exportable,
                            message: `${getName(
                                exportable
                            )} must be exported (as non default) to allow proper extension`,
                            fix: (fixer) => fixer.insertTextBefore(exportable, 'export '),
                        });
                    }
                });
        },
    }),
};
