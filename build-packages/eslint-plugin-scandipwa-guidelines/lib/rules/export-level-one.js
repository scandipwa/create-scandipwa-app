/**
 * @fileoverview Non-extensible components are not allowed.
 * @author Jegors Batovs
 */

const { constructMessage } = require('../util/messages');

const CLASS_DECLARATION = 'ClassDeclaration';
const FUNCTION_DECLARATION = 'FunctionDeclaration';
const VARIABLE_DECLARATION = 'VariableDeclaration';
const OBJECT_PATTERN = 'ObjectPattern';

const DOCUMENTATION_URL = 'https://github.com/scandipwa/eslint/blob/master/docs/rules/export-level-one.md';

const exportableTypes = [
    CLASS_DECLARATION,
    FUNCTION_DECLARATION,
    VARIABLE_DECLARATION,
];

const isDestructuringAssignment = (node) => {
    const { type, declarations } = node;

    return (
        type === VARIABLE_DECLARATION &&
        declarations.some((declaration) => declaration.id.type === OBJECT_PATTERN)
    );
};

const shouldBeExported = (node) => {
    const { type } = node;

    if (!exportableTypes.includes(type)) {
        return false;
    }

    return !isDestructuringAssignment(node)
};

const getNameFromDeclaration = (node) => {
    if ([CLASS_DECLARATION, FUNCTION_DECLARATION].includes(node.type)) {
        return node.id.name;
    }

    return 'variable';
};

const getExportErrorMessage = (exportable) => {
    const name = getNameFromDeclaration(exportable);

    const error = 'In Scandi, all top-level declarations need to be exported. This ensures that your code remains' +
        ' extensible.';
    const help = `To fix this error, export the ${ name } declaration by adding "export" before it.`;

    return constructMessage(error, help, DOCUMENTATION_URL);
};

module.exports = {
    meta: {
        docs: {
            description:
                'Everything declared in module on the first nesting level should be exported.',
            category: 'Coding standard',
            recommended: false,
            url: DOCUMENTATION_URL,
        },
        fixable: 'code',
    },

    create: (context) => ({
        Program(node) {
            const { body } = node;

            body
                .filter((node) => shouldBeExported(node))
                .map((declarationNode) => {
                    context.report({
                        node: declarationNode,
                        message: getExportErrorMessage(declarationNode),
                        fix: (fixer) => fixer.insertTextBefore(declarationNode, 'export '),
                    });
                });
        },
    }),
};
