const path = require('path');
const fs = require('fs');

const prepareSources = require('./lib/sources');

const {
    prepareExtensions,
    getExtensionProvisionedPath
} = require('./lib/extensions');

const escapeRegex = require('@scandipwa/scandipwa-dev-utils/escape-regex');
const { getParentThemePaths } = require('@scandipwa/scandipwa-dev-utils/parent-theme');

class FallbackPlugin {
    /**
     * Constructor, options provider
     * @param {object} options
     */
    constructor(options = {}) {
        if (typeof options !== 'object') {
            throw new Error('Fallback plugin expects options argument to be an object.');
        }

        const {
            sources,
            processRoot
        } = options;

        if (!sources) {
            throw new Error('Fallback plugin expects sources object as an option.');
        }

        this.options = {
            sources: prepareSources(sources),
            extensions: prepareExtensions(processRoot)
        };
    }

    /**
     * Get first (by priority) source which contains the file given
     *
     * @static
     * @param {string} pathname - relative path to file (i.e. ./src/index.js)
     * @param {object} sources - array of sources
     * @return {string} - absolute path to top-priority matching source
     * @memberof FallbackPlugin
     */
    static getFallbackPathname(pathname, cwd = process.cwd()) {
        const sourcePaths = [
            cwd,
            ...getParentThemePaths(cwd)
        ];

        for (let i = 0; i < sourcePaths.length; i++) {
            const sourcePath = sourcePaths[i];
            const sourcePathname = path.join(sourcePath, pathname);
            const isFileExists = fs.existsSync(sourcePathname);

            if (isFileExists) {
                return sourcePathname;
            }
        }

        const { absolutePath } = getExtensionProvisionedPath(pathname, cwd);

        if (absolutePath) {
            // check if the pathname is available in provisioned paths of extensions
            return absolutePath;
        }

        return path.join(
            sourcePaths[0],
            pathname
        );
    }

    /**
     * Find which source index does the file given came from
     *
     * @param {string} pathname - absolute path to file / folder
     * @return {string} - source key
     * @memberof FallbackPlugin
     */
    getSourceIndex(pathname) {
        const { sources } = this.options;

        for (let i = 0; i < sources.keys.length; i++) {
            const source = sources.keys[i];

            if (sources.getRegexOf(source).test(pathname)) {
                return i;
            }
        }

        return 0;
    }

    /**
     * Get relative pathname of file given (relative to any source root)
     *
     * @param {string} pathname - absolute pathname
     * @return {string}
     * @memberof FallbackPlugin
     */
    getRelativePathname(pathname) {
        const isSrc = new RegExp(escapeRegex(`${path.sep}src${path.sep}`)).test(pathname);
        const prefix = isSrc ? 'src' : 'public';

        // take the last occurrence of the prefix and get the path after it
        const relativePathname = pathname.split(`${prefix}${path.sep}`).slice(-1).join(`${prefix}${path.sep}`);
        const extension = this.getBelongingExtension(pathname);

        if (extension) {
            // If this is extension, the path to override files can be located
            // in src/<EXTENSION NAME>/component/etc -> use it
            return path.join(prefix, extension, relativePathname);
        }

        if (relativePathname) {
            return path.join(prefix, relativePathname);
        }

        return '';
    }

    /**
     * Check for file existence, accounting for file extension
     *
     * @param {string} pathname - absolute pathname
     * @return {boolean}
     * @memberof FallbackPlugin
     */
    fileExists(pathname) {
        // if extension is already present - check for existence
        if (/\..{1,4}$/.test(pathname)) {
            return fs.existsSync(pathname);
        }

        // all ".style" and "style/" must end with ".scss"
        if (new RegExp([
            escapeRegex('.style'),
            escapeRegex(`style${ path.sep }`)
        ].join('|')).test(pathname)) {
            return fs.existsSync(`${ pathname }.scss`);
        }

        // TODO: try require.resolve here
        // we do not know at this point if this is:
        // .ts, .tsx, .jsx or /index.js, /index.ts, /index.tsx => check all
        return (
            fs.existsSync(`${ pathname }.js`)
            || fs.existsSync(`${ pathname }.ts`)
            || fs.existsSync(`${ pathname }.tsx`)
            || fs.existsSync(`${ pathname }${path.sep}index.js`)
            || fs.existsSync(`${ pathname }${path.sep}index.ts`)
            || fs.existsSync(`${ pathname }${path.sep}index.tsx`)
        );
    }

    /**
     * Get absolute path to "TO" file from resolve request
     *
     * @param {object} request - Webpack resolve request
     */
    getRequestToPathname(request) {
        if (path.isAbsolute(request.request)) {
            return request.request;
        }

        return path.join(request.path, request.request);
    }

    /**
     * Get absolute path to "FROM" from file resolve request
     *
     * @param {object} request - Webpack resolve request
     */
    getRequestFromPathname(request) {
        return request.context.issuer;
    }

    /**
     * Get the extension which the pathname belongs to
     * can be changed to regex later on
     *
     * @param {String} pathname
     */
    getBelongingExtension(pathname) {
        const { extensions } = this.options;

        // Skip null paths
        if (!pathname) {
            return '';
        }

        // Skip all non-absolute paths
        if (!path.isAbsolute(pathname)) {
            return '';
        }

        for (let i = 0; i < extensions.entries.length; i++) {
            const [packageName, sourcePath] = extensions.entries[i];
            const sourcePathSrc = path.join(sourcePath, 'src');
            const sourcePathPublic = path.join(sourcePath, 'public');

            if (
                pathname.includes(sourcePathSrc)
                || pathname.includes(sourcePathPublic)
            ) {
                return packageName;
            }
        }

        return '';
    }

    /**
     * Get if path is coming from sources src/ or /pub directory
     *
     * @param {*} pathname
     */
    getIsFallbackNeeded(pathname) {
        const { sources, extensions } = this.options;

        // Skip null paths
        if (!pathname) {
            return true;
        }

        // Skip all non-absolute paths
        if (!path.isAbsolute(pathname)) {
            return true;
        }

        const paths = [
            ...sources.values,
            ...extensions.values
        ];

        // Check if request is coming from ScandiPWA
        // sources or extension folders (/src or /pub)
        for (let i = 0; i < paths.length; i++) {
            const sourcePath = paths[i];
            const sourcePathSrc = path.join(sourcePath, 'src');
            const sourcePathPublic = path.join(sourcePath, 'public');

            if (
                pathname.includes(sourcePathSrc)
                || pathname.includes(sourcePathPublic)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Webpack function responsible for resolve request handling
     *
     * @param {object} resolver
     */
    apply(resolver) {
        const { sources } = this.options;

        resolver.getHook('resolve').tapAsync('FallbackPlugin', (
            request, resolveContext, callback
        ) => {
            const requestToPathname = this.getRequestToPathname(request);
            const requestToRelativePathname = this.getRelativePathname(requestToPathname);

            /**
             * If we were unable to determine the relative pathname - we ignore the request.
             */
            if (!requestToRelativePathname) {
                callback();
                return;
            }

            const requestFromPathname = this.getRequestFromPathname(request);
            const requestFromIndex = this.getSourceIndex(requestFromPathname);
            const requestToIndex = this.getSourceIndex(requestToPathname);

            if (!this.getIsFallbackNeeded(requestFromPathname)) {
                callback();
                return;
            }

            /**
             * If requestFromIndex < requestToIndex => from top priority to low priority request
             * From project to core => 0 < 1 => we should start resolving from next to project index
             */
            for (
                let i = requestFromIndex < requestToIndex ? requestFromIndex + 1 : 0;
                i < sources.entries.length;
                i++
            ) {
                const [source, pathname] = sources.entries[i];
                const requestToSourcePathname = path.join(pathname, requestToRelativePathname);

                if (this.fileExists(requestToSourcePathname)) {
                    if (requestToSourcePathname === requestToPathname) {
                        callback();
                        return;
                    }

                    resolver.doResolve(
                        resolver.hooks.resolve,
                        {
                            ...request,
                            path: sources[source],
                            request: `.${path.sep}${ requestToRelativePathname}`
                        },
                        'Resolving using the override-mechanism!',
                        resolveContext,
                        callback
                    );

                    return;
                }
            }

            const {
                packagePath,
                relativePath,
                absolutePath
            } = getExtensionProvisionedPath(requestToRelativePathname);

            if (packagePath) {
                if (!this.fileExists(absolutePath)) {
                    callback();
                    return;
                }

                // check if the pathname is available in provisioned paths of extensions
                resolver.doResolve(
                    resolver.hooks.resolve,
                    {
                        ...request,
                        path: packagePath,
                        request: `.${ path.sep }${ relativePath }`
                    },
                    'Resolving using the module-preference!',
                    resolveContext,
                    callback
                );

                return;
            }

            callback();
        });
    }
}

module.exports = FallbackPlugin;
