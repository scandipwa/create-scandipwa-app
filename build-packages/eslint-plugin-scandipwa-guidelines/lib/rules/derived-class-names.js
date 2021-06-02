/**
 * @fileoverview Class name must match the name of the file it is declared in.
 * @author Jegors Batovs
 */
const { constructMessage } = require('../util/messages.js');
const { getIdentifierOccurrences } = require('../util/ast.js');
const { getExpectedClassNameFromFilename, shouldClassNameBeEnforced } = require('../util/derived-class-name.js');
const { getFilenameFromPath } = require("../util/path.js");

const DOCUMENTATION_LINK =
    "https://github.com/scandipwa/eslint/blob/master/docs/rules/derived-class-names.md";


function getUnexpectedNameMessage(filename, expectedName, actualName) {
    const error = `In Scandi, class names need to be based on the file name. Since the filename is ${ filename } the class name should be ${ expectedName }.`;
    const help = `To fix this error, rename ${ actualName } to ${ expectedName }.`;

    return constructMessage(error, help, DOCUMENTATION_LINK);
}

module.exports = {
    meta: {
        docs: {
            description: 'Class name must match the name of the file it is declared in.',
            category: 'Coding standard',
            recommended: true,
            url: DOCUMENTATION_LINK
        },
        fixable: 'code',
    },

    create: context => ({
        ClassDeclaration(node) {
            const filePath = context.getFilename();
            const fileName = getFilenameFromPath(filePath);

            if (!shouldClassNameBeEnforced(fileName)) {
                return;
            }

            const expectedClassName = getExpectedClassNameFromFilename(fileName);
            const actualClassName = node.id.name;

            if (expectedClassName !== actualClassName) {
                const wrongNodes = getIdentifierOccurrences(context, actualClassName);

                wrongNodes.forEach((node) => {
                    const { loc } = node;

                    context.report({
                        loc,
                        message: getUnexpectedNameMessage(fileName, expectedClassName, actualClassName),
                        fix: fixer => fixer.replaceText(node, expectedClassName),
                    });
                })
            }
        },
    }),
};
