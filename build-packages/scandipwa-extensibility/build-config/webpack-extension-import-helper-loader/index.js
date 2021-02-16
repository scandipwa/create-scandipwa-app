const path = require('path');

const getSlicePoint = (source) => {
    // Attempt to match by hook
    const hookMatcher = '/** ENTRY__HOOK */';
    const hookPosition = source.indexOf(hookMatcher);

    if (hookPosition) {
        return hookPosition;
    }

    // Attempt to match by imports
    const importMatcher = /^import .+$/gm;
    const imports = source.match(importMatcher);

    // If no imports => make one
    if (!imports || !imports.length) {
        return 0;
    }

    // There are imports => take the first one
    const firstImport = imports[0];
    const firstImportPosition = source.indexOf(firstImport);

    return firstImportPosition;
};

/**
 * This will import the neighboring runtime-helpers into the application
 * The import will be the last import in the application's entry point
 * But it will occur before ReactDOM.render()
 */
module.exports = function injectImports(source) {
    const injectablePath = path.resolve(__dirname, '..', '..', 'runtime-helpers');
    const injectableCode = `import '${injectablePath}';\n`;

    const slicePoint = getSlicePoint(source);

    const codeBeforeInjectable = source.slice(0, slicePoint);
    const codeAfterInjectable = source.slice(slicePoint);

    const injectedCode = [
        codeBeforeInjectable,
        injectableCode,
        codeAfterInjectable
    ].join('');

    return injectedCode;
};
