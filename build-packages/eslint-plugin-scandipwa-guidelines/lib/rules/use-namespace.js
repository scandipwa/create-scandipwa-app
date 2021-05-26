/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

const path = require('path');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const fixNamespaceLack = require('../util/fix-namespace-lack.js');
const getLeadingCommentsForNode = require('../util/get-leading-comments');
const { walkDirectoryUp } = require('@scandipwa/scandipwa-dev-utils/get-context');

const types = {
    ExportedClass: [
        'ExportNamedDeclaration',
        'ClassDeclaration',
    ].join(' > '),

    ExportedArrowFunction: [
        'ExportNamedDeclaration',
        'VariableDeclaration',
        'VariableDeclarator',
        'ArrowFunctionExpression',
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
        'ArrowFunctionExpression',
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

    getNodeDescription: node => {
        if (types.isPromiseHandlerArrowFunction(node)) return 'promise handler arrow function';
        if (types.isExportedArrowFunction(node)) return 'exported arrow function';
        if (types.isExportedClass(node)) return 'exported class';

        throw new Error("Unexpected node; could not provide description", node)
    },
};

const NAMESPACEABLE_NODE = [
    types.ExportedClass,
    types.PromiseHandlerArrowFunction,
    types.ExportedArrowFunction,
].join(',');

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
    const parent = getProperParentNode(node);
    return getLeadingCommentsForNode(parent, sourceCode)
        .find(
            comment => comment.value.includes('@namespace'),
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
};

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
};

const prepareFilePath = (pathname) => {
    const {
        name: filename,
        dir,
    } = path.parse(pathname);

    const [name, postfix = ''] = filename.split('.');

    /**
     * We do not want the \\ paths on Windows, rather / =>
     * split and then join with correct delimiter
     **/
    return path.join(
        dir,
        // If dir name === file name without postfix => do not repeat it
        new RegExp(`${ path.sep }${ name }$`).test(dir) ? '' : name,
        postfix,
    ).split(path.sep)
        .filter(x => x.length > 0);
};

const formatPackageName = (packageName) => {
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

    return `${ org.slice(1) }/${ name }`;
};

const getPackageName = (context) => {
    const filePath = context.getFilename();

    // if we are in a unit test, mock the package name
    if (filePath === "<input>") {
        return 'TestPackage';
    }

    const modulePath = walkDirectoryUp(filePath).pathname;
    const { name } = getPackageJson(modulePath);

    return name;
};

const getPackageRelativePath = (context) => {
    const filePath = context.getFilename();

    // if we are in a unit test, mock the relative path
    if (filePath === "<input>") {
        return 'test/path';
    }

    const modulePath = walkDirectoryUp(filePath).pathname;
    return path.relative(modulePath, filePath).replace(/^(\.\/)?src\//, '');
};

const getExpectedNamespace = (node, context) => {
    const packageName = getPackageName(context);
    const fileRelative = getPackageRelativePath(context);

    // Not using path.join to support windows
    const pathname = [
        formatPackageName(packageName),
        // Trim post-fixes if they are not present
        ...prepareFilePath(fileRelative),
    ].join('/').replace(
        // Convert to pascal-case, and trim "-"
        /\b[a-z](?=[a-z]{2})/g,
        (letter) => letter.toUpperCase(),
    ).split('-').join('');

    // Do not transform code to uppercase / lowercase it should be written alright
    return `${ pathname }/${ getNodeNamespace(node) }`;
};

const getActualNamespace = ({ value: comment = '' }) => {
    const {
        groups: {
            namespace,
        } = {},
    } = comment.match(/@namespace +(?<namespace>[^ ]+)/) || {};

    return namespace;
};

module.exports = {
    meta: {
        docs: {
            description: 'Use @namespace comment-decorators',
            category: 'Extensibility',
            recommended: true,
        },
        fixable: 'code',
    },

    create: context => ({
        [NAMESPACEABLE_NODE]: (node) => {
            const namespaceComment = getNamespaceCommentForNode(node, context.getSourceCode()) || { value: '' };
            const namespaceCommentString = namespaceComment.value.split('@namespace').pop().trim();

            const actualNamespace = getActualNamespace(namespaceComment);
            const expectedNamespace = getExpectedNamespace(node, context);

            if (!namespaceCommentString) {
                context.report({
                    node,
                    message: `Provide namespace for ${ types.getNodeDescription(node) } by using @namespace magic comment`,
                    fix: fixer => fixNamespaceLack(
                        fixer,
                        getProperParentNode(node),
                        context,
                        expectedNamespace,
                    ) || [],
                });
            } else if (expectedNamespace !== namespaceCommentString) {
                context.report({
                    node,
                    message: `Namespace for this node is not valid! Consider changing it to ${ expectedNamespace }`,
                    fix: fixer => {
                        const newNamespaceCommentContent = namespaceComment.value.replace(actualNamespace, expectedNamespace);
                        const newNamespaceComment = namespaceComment.type === 'Block'
                            ? `/*${ newNamespaceCommentContent }*/`
                            : `// ${ newNamespaceCommentContent }`;

                        return fixer.replaceText(
                            namespaceComment,
                            newNamespaceComment,
                        )
                    },
                });
            }
        },
    }),
};
