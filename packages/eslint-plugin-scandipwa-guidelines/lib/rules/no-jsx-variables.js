/**
 * @fileoverview Setting JSX in state is not allowed
 * @author Alfreds Genkins
 */

module.exports = {
    meta: {
        docs: {
            description: 'Prohibit assigning JSX to variables and object properties',
            category: 'Coding standard',
            recommended: false,
        },
        fixable: 'code',
    },
    create: (context) => ({
        VariableDeclarator(node) {
            const { init: { type } } = node;

            if (type !== 'JSXElement') {
                return;
            }

            context.report({
                node,
                message: 'Do not assign JSX to variables.',
            });
        },
        Property(node) {
            const { value: { type } } = node;

            if (type !== 'JSXElement') {
                return;
            }

            const { parent: { parent } } = node;

            if (parent) {
                const name = getName(parent);

                console.log(name);

                if (/(map|list)/.test(name.toLowerCase())) {
                    return;
                }
            }

            context.report({
                node: parent,
                message: 'Do not assign JSX to object properties.',
            });
        }
    })
};