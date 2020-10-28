/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

const path = require('path');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const fixNamespaceLack = require('../util/fix-namespace-lack.js');

const types = {
    ExportedClass: [
        'ExportNamedDeclaration',
        'ClassDeclaration'
    ].join(' > '),

    ExportedArrowFunction: [
        'ExportNamedDeclaration',
        'VariableDeclaration',
        'VariableDeclarator',
        'ArrowFunctionExpression'
    ].join(' > '),

    isExportedClass: node => node.type === 'ClassDeclaration'
        && node.parent.type === 'ExportNamedDeclaration',

    isExportedArrowFunction: node => node.type === 'ArrowFunctionExpression'
        && node.parent.type === 'VariableDeclarator'
        && node.parent.parent.type === 'VariableDeclaration'
        && node.parent.parent.parent.type === 'ExportNamedDeclaration',

    PromiseHandlerArrowFunction: [
        [
          "CallExpression",
          "[callee.type='MemberExpression']",
          "[callee.object.name!=/.+Dispatcher/]",
          ":matches(",
          	"[callee.property.name='then'], ",
          	"[callee.property.name='catch']",
          ")",
        ].join(''),
        'ArrowFunctionExpression'
    ].join(' > '),

    isPromiseHandlerArrowFunction: (node) => {
        const { parent } = node;
        const promiseHandlerNames = ['then', 'catch'];

        return (
            node.type === 'ArrowFunctionExpression'
			&& parent.type === 'CallExpression'
			&& parent.callee.type === 'MemberExpression'
			&& !(parent.callee.object.name || "").endsWith('Dispatcher')
			&& promiseHandlerNames.includes(parent.callee.property.name)
        );
    },

    isHandleableArrowFunction: node => types.isExportedArrowFunction(node)
        || types.isPromiseHandlerArrowFunction(node),

    detectType: node => {
        if (types.isPromiseHandlerArrowFunction(node)) return 'promise handler arrow function';
        if (types.isExportedArrowFunction(node)) return 'exported arrow function';
        if (types.isExportedClass(node)) return 'exported class';
    }
};

const getProperParentNode = (node) => {
    if (types.isExportedClass(node)) {
        return node.parent;
    }
    if (types.isExportedArrowFunction(node)) {
        return node.parent.parent.parent;
    }
    if (types.isPromiseHandlerArrowFunction(node)) {
        return node;
    }

    return {};
};

const getNamespaceCommentForNode = (node, sourceCode) => {
    const getNamespaceFromComments = (comments = []) => comments.find(
        comment => comment.value.includes('@namespace')
    );

    return getNamespaceFromComments(
        sourceCode.getCommentsBefore(getProperParentNode(node))
    );
};

const collectFunctionNamespace = (node, stack) => {
    if (node.type === 'CallExpression') {
        if (node.callee.type === 'MemberExpression') {
            stack.push(node.callee.property.name);
            collectFunctionNamespace(node.callee.object, stack);
        } else if (node.callee.type === 'Identifier') {
            stack.push(node.callee.name);
        }
    }
}

const getNodeNamespace = (node) => {
    const stack = [];

    if (node.parent.type === 'VariableDeclarator') {
        stack.push(node.parent.id.name)
    } else if (node.type === 'ClassDeclaration') {
        stack.push(node.id.name);
    } else {
        collectFunctionNamespace(node.parent, stack);
    }

    return stack.reverse().join(path.sep);
}

const prepareFilePath = (pathname) => {
    const {
        name: filename,
        dir
    } = path.parse(pathname);

	const [name, postfix = ''] = filename.split('.');

    return path.join(
		dir,
		// If dir name === file name without postfix => do not repeat it
		new RegExp(`${path.sep}${name}$`).test(dir) ? '' : name,
		postfix
	);
}

const preparePackageName = (packageName) => {
    const [org, name] = packageName.split(path.sep);

    if (org === '@scandipwa') {
        // Legacy support
        if (name === 'scandipwa') {
            return '';
        }

        return name;
    }

    return path.join(org.slice(1), name);
};

const generateNamespace = (node, context) => {
    const filename = context.getFilename();
    const splitted = filename.split('src');
    const toFile = splitted.pop();
    const toPackage = path.normalize(splitted.join('src'));
    const { name: packageName } = getPackageJson(toPackage);

    const pathname = path.join(
        // remove @ from organization, support @scandipwa legacy namespaces
        preparePackageName(packageName),
        // trim post-fixes if they are not present
        prepareFilePath(toFile)
    ).replace(
        // Convert to pascal-case, and trim "-"
        /\b[a-z](?=[a-z]{2})/g,
        (letter) => letter.toUpperCase()
	).replace('-', '');

    // do not transform code to uppercase / lowercase it should be written alright
    return path.join(pathname, getNodeNamespace(node));
}

const extractNamespaceFromComment = ({ value: comment = '' }) => {
	const {
		groups: {
			namespace
		} = {}
	} = comment.match(/@namespace +(?<namespace>[^ ]+)/) || {};

	return namespace;
};

module.exports = {
    meta: {
        docs: {
            description: 'Use @namespace comment-decorators',
            category: 'Extensibility',
            recommended: true
        },
        fixable: 'code'
    },

    create: context => ({
        [[
            types.ExportedClass,
            types.PromiseHandlerArrowFunction,
            types.ExportedArrowFunction
        ].join(',')](node) {
			const namespaceComment = getNamespaceCommentForNode(node, context.getSourceCode());

			const namespace = extractNamespaceFromComment(namespaceComment);
			const generatedNamespace = generateNamespace(node, context);

            if (!namespaceComment) {
                context.report({
                    node,
                    message: `Provide namespace for ${types.detectType(node)} by using @namespace magic comment`,
                    fix: fixer => fixNamespaceLack(
						fixer,
						getProperParentNode(node),
						context,
						generatedNamespace
					) || []
                });
			} else if (generatedNamespace !== namespaceComment) {
				context.report({
                    node,
                    message: `Namespace for this node is not valid! Consider changing it to ${generatedNamespace}`,
                    fix: fixer => {
						const newNamespaceCommentContent = namespaceComment.value.replace(namespace, generatedNamespace);
						const newNamespaceComment = namespaceComment.type === 'Block'
							? `/*${newNamespaceCommentContent}*/`
							: `// ${newNamespaceCommentContent}`;

						return fixer.replaceText(
							namespaceComment,
							newNamespaceComment
						)
					}
                });
			}
        }
    })
};
