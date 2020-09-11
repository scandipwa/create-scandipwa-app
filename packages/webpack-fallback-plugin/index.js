/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

const path = require('path');
const fs = require('fs');

const prepareSources = require('./lib/sources');

// TODO: rework hard-coded /src and /pub apendixes, add dynamic list instead

class FallbackPlugin {
    /**
     * Constructor, options provider
     * @param {object} options
     */
    constructor(options = {}) {
        if (typeof options !== 'object') {
            throw new Error('Fallback plugin expects options argument to be an object.');
        }

        const { sources } = options;

        if (!sources) {
            throw new Error('Fallback plugin expects sources object as an option.');
        }

        this.options = {
            sources: prepareSources(sources)
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
    static getFallbackPathname(pathname, sources) {
        for (const source in sources) {
            const sourcePathname = path.join(sources[source], pathname);
            const isFileExists = fs.existsSync(sourcePathname);

            if (isFileExists) {
                return sourcePathname;
            }
        }

        return path.join(
            Object.values(sources)[0],
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
        const relativeSourcePathname = pathname.split('src/')[1];

        if (relativeSourcePathname) {
            return `src/${ relativeSourcePathname}`;
        }

        const relativePublicPathname = pathname.split('public/')[1];

        if (relativePublicPathname) {
            return `pubic/${ relativePublicPathname }`;
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
        if (/\.style|style\//.test(pathname)) {
            return fs.existsSync(`${ pathname }.scss`);
        }

        // we do not know at this point if this is /index.js or .js => check both
        return fs.existsSync(`${ pathname }.js`) || fs.existsSync(`${ pathname }/index.js`);
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
     * Get if path is coming from sources src/ or /pub directory
     * 
     * @param {*} pathname 
     */
    getIsFromSources(pathname) {
        const { sources } = this.options;

        // Skip null paths
        if (!pathname) {
            return true;
        }

        // Skip all non-absolute paths
        if (!path.isAbsolute(pathname)) {
            return true;
        }

        // Check if request is coming from ScandiPWA sources (/src or /pub) folders
        for (let i = 0; i < sources.values.length; i++) {
            const sourcePath = sources.values[i];
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

            if (!this.getIsFromSources(requestFromPathname)) {
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
                            request: `./${ requestToRelativePathname}`
                        },
                        'Resolving with fallback!',
                        resolveContext,
                        callback
                    );

                    return;
                }
            }

            callback();
        });
    }
}

module.exports = FallbackPlugin;
