const path = require('path');

/**
 * This will import the neighboring runtime-helpers into the application
 * The import will be the last import in the application's entry point
 * But it will occur before ReactDOM.render()
 */
module.exports = function injectImports(source) {
    const injectablePath = path
        .resolve(__dirname, '..', '..', 'runtime-helpers')
        .split(path.sep)
        .join(path.posix.sep);

    const injectableCode = `import '${injectablePath}';\n`;

    const importMatcher = /^import .+$/gm;
    const imports = source.match(importMatcher);

    const firstImport = imports[0];
    const firstImportPosition = source.indexOf(firstImport);

    const codeBeforeInjectable = source.slice(0, firstImportPosition);
    const codeAfterInjectable = source.slice(firstImportPosition);

    const injectedCode = [
        codeBeforeInjectable,
        injectableCode,
        codeAfterInjectable
    ].join('');

    return injectedCode;
};
