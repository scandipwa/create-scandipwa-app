/**
 * @fileoverview Class name must match the name of the file it is declared in.
 * @author Jegors Batovs
 */
const path = require('path');

const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports = {
    meta: {
        docs: {
            description: 'Class name must match the name of the file it is declared in.',
            category: 'Coding standard',
            recommended: true
        },
        fixable: 'code'
    },

    create: context => ({
        ClassDeclaration(node) {
            const filePath = context.getFilename();
            const exploded = filePath.split(path.sep);
            const [filename, postfix] = exploded[exploded.length - 1].split('.');

            if (filename === 'index' || postfix.length <= 3) {
                // Ignore index files, they could have anything in them
                // Ignore files without postfix, AKA postfix is a file extension
                return;
            }

            const expectedClassName = capitalize(filename) + capitalize(postfix);

            if (expectedClassName !== node.id.name) {
                // Check if expected class name does match the node class name
                const { id: { loc } } = node;

                context.report({
                    loc,
                    message: 'Class name must be derived from the file name, using postfix.',
                    fix: fixer => fixer.replaceText(node.id, expectedClassName)
                });
            }
        }
    })
};
