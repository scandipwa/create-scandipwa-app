const { getExtensionsForCwd } = require('./extensions-core');

/**
 * Extensions available for ScandiPWA Fallback mechanism
 * When no CWD should be supplied
 * Kept for now for backwards-compatibility
 * Prefer using utils from `extensions-core`
 *
 * @typedef {Object} ExtensionObject
 * @property {String} packagePath - path to extension package root
 * @property {Object} packageJson - extension package.json source
 * @property {String} packageName - extension package name
 */

/** @type {*} */
const extensions = getExtensionsForCwd();

module.exports = extensions;
