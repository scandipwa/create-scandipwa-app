const getAllExtensionImports = require('./util/get-all-extension-imports');

/**
 * This injects plugins into the application
 * ExtUtils must be globally provided for this
 */
module.exports = function injectImports(source) {
    const injectableCode = `ExtUtils.setPlugins([${ getAllExtensionImports() }]);\n`;

    return [
        injectableCode,
        source
    ].join('');
};
