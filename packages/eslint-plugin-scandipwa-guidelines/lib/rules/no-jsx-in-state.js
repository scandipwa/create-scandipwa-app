/**
 * @fileoverview Setting JSX in state is not allowed
 * @author Alfreds Genkins
 */

module.exports = {
    meta: {
        docs: {
            description: 'Setting JSX in state is not allowed',
            category: 'Coding standard',
            recommended: false,
        },
        fixable: 'code',
    },
    create: (context) => ({
        CallExpression: (node) => {
            const {
                parent: {
                    parent: {
                        // we will search for declarations in setState function root
                        body
                    }
                },
                callee: {
                    object,
                    property
                },
                arguments: args
            } = node;

            if (!object || !property) {
                // skip function calls, which are no object property calls
                return;
            }

            if (
                object.type !== 'ThisExpression'
                || property.name !== 'setState'
            ) {
                // skip all non this.setState function calls
                return;
            }

            // only look at first parameter
            const stateObject = args[0];

            if (!stateObject) {
                // skip setState without arguments
                return;
            }

            if (stateObject.type !== 'ObjectExpression') {
                // skip non object setState
                // TODO: implement function handling
                return;
            }

            // collect all used is setState vars and their locations
            const vars = stateObject.properties.reduce(
                (acc, { value: { name, loc } }) => ({ ...acc, [name]: loc }),
                {}
            );

            for (let i = 0; i < body.length; i++) {
                const varNode = body[i];

                if (varNode.type !== 'VariableDeclaration') {
                    // skip all non-variable declarations
                    continue;
                }

                const { declarations } = varNode;

                for (let j = 0; j < declarations.length; j++) {
                    const { id, init } = declarations[j];

                    if (
                        init.type !== 'JSXElement'
                        || !Object.keys(vars).includes(id.name)
                    ) {
                        // skip all non JSX declarations and var names, which are no used in setState
                        continue;
                    }

                    context.report({
                        loc: vars[id.name],
                        message: 'Setting JSX into the state is not allowed',
                    });
                }
            }
        }
    })
};