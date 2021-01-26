/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

const path = require('path');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const fixNamespaceLack = require('../util/fix-namespace-lack.js');
const getLeadingCommentsForNode = require('../util/get-leading-comments');

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
        getLeadingCommentsForNode(getProperParentNode(node), sourceCode)
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

    // not using path.sep on purpose
    return stack.reverse().join('/');
}

const prepareFilePath = (pathname) => {
    const {
        name: filename,
        dir
    } = path.parse(pathname);

	const [name, postfix = ''] = filename.split('.');

    /**
     * We do not want the \\ paths on Windows, rather / =>
     * split and then join with correct delimiter
     **/
    return path.join(
		dir,
		// If dir name === file name without postfix => do not repeat it
		new RegExp(`${path.sep}${name}$`).test(dir) ? '' : name,
		postfix
    ).split(path.sep)
    // Filter out empty strings if they exist
    .filter(x => !!x);
}

const preparePackageName = (packageName) => {
    // This is on purpose not a path.sep (windows support)
    const [org = '', name = ''] = packageName.split('/');

    if (!name) {
        // if there is no name => there is not ORG
        if (packageName === '<%= name %>') {
            return 'placeholder'
        }

        return packageName;
    }

    if (org === '@scandipwa') {
        // Legacy support
        if (name === 'scandipwa') {
            return '';
        }

        return name;
    }

    return `${org.slice(1)}/${name}`;
};

const generateNamespace = (node, context) => {
    const filename = context.getFilename();
    const splitted = filename.split('src');
    const toFile = splitted.pop();
    const toPackage = path.normalize(splitted.join('src'));
    const { name: packageName } = getPackageJson(toPackage);

    // Not using path.join to support windows
    const pathname = [
        // remove @ from organization, support @scandipwa legacy namespaces
        preparePackageName(packageName),
        // Trim post-fixes if they are not present
        ...prepareFilePath(toFile)
    ].join('/').replace(
        // Convert to pascal-case, and trim "-"
        /\b[a-z](?=[a-z]{2})/g,
        (letter) => letter.toUpperCase()
    ).replaceAll('-', '');

    // Do not transform code to uppercase / lowercase it should be written alright
    return `${pathname}/${getNodeNamespace(node)}`;
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
            const namespaceComment = getNamespaceCommentForNode(node, context.getSourceCode()) || { value: '' };
            const namespaceCommentString = namespaceComment.value.split('@namespace').pop().trim();

			const namespace = extractNamespaceFromComment(namespaceComment);
			const generatedNamespace = generateNamespace(node, context);

            if (!namespaceCommentString) {
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
			} else if (generatedNamespace !== namespaceCommentString) {
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
