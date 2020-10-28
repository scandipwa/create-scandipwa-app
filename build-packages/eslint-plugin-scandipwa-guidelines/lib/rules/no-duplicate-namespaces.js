/**
* @fileoverview Use namespace decorators for exports
* @author Jegors Batovs
*/

const getNamespaceFromComment = (commentValue) => {
	const match = commentValue.match(/@namespace (?<namespace>[\w|/]+)/);
	if (!match) {
		return;
	}
	const { groups: { namespace } } = match;

	return namespace;
}

const getDuplicateNamespaces = (namespaces) => {
	const processedNamespaces = new Set();

	return namespaces.reduce((duplicates, namespace) => {
		if (processedNamespaces.has(namespace)) {
			return duplicates.add(namespace);
		}

		processedNamespaces.add(namespace);
		return duplicates;
	}, new Set())
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
		Program(node) {
			const comments = context.getSourceCode().getAllComments();

			const foundNamespaces = comments.reduce((namespaces, comment) => {
				const namespace = getNamespaceFromComment(comment.value);
				if (!namespace) {
					return namespaces;
				}

				return namespaces.concat(namespace);
			}, []);

			const duplicateNamespaces = getDuplicateNamespaces(foundNamespaces);
			duplicateNamespaces.forEach((duplicate) => comments
				.filter(({ value }) => value.match(new RegExp(`@namespace ${duplicate}`)))
				.forEach(duplicateNamespaceDeclaration => context.report({
					node: duplicateNamespaceDeclaration,
					message: `Duplicate namespace ${duplicate} found!`
				}))
			);
		}
	})
};
