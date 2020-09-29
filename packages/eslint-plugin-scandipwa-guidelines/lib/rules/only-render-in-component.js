/**
 * @fileoverview Only render methods are allowed in component
 * @author Alfreds Genkins
 */

module.exports = {
    meta: {
        docs: {
            description: 'Only render methods are allowed in component.',
            category: 'Coding standard',
            recommended: true
        },
        fixable: 'code'
    },
    create: (context) => ({
        MethodDefinition(node) {
            const filePath = context.getFilename();
            const exploded = filePath.split('/');
            const [, postfix] = exploded[exploded.length - 1].split('.');

            if (postfix !== 'component') {
                // Skip all non-components
                return;
            }

            const { key: { name } } = node;

            if (name.startsWith('render')) {
                // Skip all valid method names
                return;
            }

            context.report({
                node,
                message: 'Component should only contain rendering logic.',
                suggest: [
                    {
                        desc: "Move the method into container class.",
                    }
                ]
            });
        }
    })
}