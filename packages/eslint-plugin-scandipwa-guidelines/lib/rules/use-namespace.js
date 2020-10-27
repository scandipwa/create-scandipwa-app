/**
 * @fileoverview Use namespace decorators for exports
 * @author Jegors Batovs
 */

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
        "CallExpression[callee.type='MemberExpression']".concat(
            ":matches([callee.property.name='then'], [callee.property.name='catch'])"
        ),
        'ArrowFunctionExpression'
    ].join(' > '),

    isPromiseHandlerArrowFunction: (node) => {
        const { parent } = node;
        const promiseHandlerNames = ['then', 'catch'];

        return (
            node.type === 'ArrowFunctionExpression'
            && parent.type === 'CallExpression'
            && parent.callee.type === 'MemberExpression'
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

const getNamespaceForNode = (node, context) => {
    const getNamespaceFromComments = (comments = []) => comments.find(
        comment => comment.value.includes('@namespace')
    );

    return getNamespaceFromComments(
        context.getSourceCode().getCommentsBefore(getProperParentNode(node))
    );
}

const generateNamespace = (node, context) => {
    const filename = context.getFilename();
    const splitted = filename.split('src');
    const [toFile] = path.normalize(splitted.splice(-1));
    const toPackage = path.normalize(splitted.join('src/'));
    const { name: packageName } = getPackageJson(toPackage);
    // TODO: transform the packageName to first namespace part
    // TODO: transform the toFile and node location to second namespace part
}

const isPlugin = (node) => {
    return node &&
        node.id &&
        node.id.name &&
        node.id.name.match(/[P|p]lugin/);
}

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
            const namespace = getNamespaceForNode(node, context);

            if (!namespace && !isPlugin(node)) {
                context.report({
                    node,
                    message: `Provide namespace for ${types.detectType(node)} by using @namespace magic comment`,
                    fix: fixer => {
                        const newNamespace = generateNamespace(node, context);
                        return [fixNamespaceLack(fixer, getProperParentNode(node), context, newNamespace)].filter(value => value)
                    }
                });
            }
        }
    })
};
