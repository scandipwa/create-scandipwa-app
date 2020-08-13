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

const PROJECT = 'project';
const FALLBACK = 'fallback';

class FallbackPlugin {
    constructor(options) {
        this.options = Object.assign(FallbackPlugin.defaultOptions, options);
    }

    static getFallbackPathname(pathname) {
        const isProjectFilePresent = fs.existsSync(pathname);

        if (isProjectFilePresent) {
            return pathname;
        }

        return path.join(
            // TODO: use actual value, not default options
            FallbackPlugin.defaultOptions.fallbackRoot,
            pathname
        );
    }

    getProjectRegex() {
        return new RegExp(this.options.projectRoot);
    }

    getDestination(pathname) {
        if (this.getProjectRegex().test(pathname)) {
            return PROJECT;
        }

        return FALLBACK;
    }

    getRelativePathname(pathname) {
        const relativePathname = pathname.split('src/')[1];
        return `src/${ relativePathname}`;
    }

    fileExists(pathname) {
        // TODO: fonts fix
        if (/\.scss$/.test(pathname)) { // if extension is already present - check for existence
            return fs.existsSync(pathname);
        }

        if (/\.style|style\//.test(pathname)) { // all ".style" and "style/" must end with ".scss"
            return fs.existsSync(`${ pathname }.scss`);
        }

        // we do not know at this point if this is /index.js or .js => check both
        return fs.existsSync(`${ pathname }.js`) || fs.existsSync(`${ pathname }/index.js`);
    }

    // Default plugin entry-point function
    apply(resolver) {
        resolver.getHook('resolve').tapAsync('FallbackPlugin', (request, resolveContext, callback) => {
            const requestToPathname = path.join(request.path, request.request);
            const requestToRelativePathname = this.getRelativePathname(requestToPathname);
            const requestToProjectPathname = path.join(this.options.projectRoot, requestToRelativePathname);

            const resolveRequest = (to) => {
                const newRequest = { ...request };

                if (to === FALLBACK) {
                    newRequest.path = this.options.fallbackRoot;
                    newRequest.request = `./${ requestToRelativePathname}`;
                }

                resolver.doResolve(
                    resolver.hooks.resolve,
                    newRequest,
                    'Resolving with fallback!',
                    resolveContext,
                    callback
                );
            };

            // the file exists in a project, prefer it
            if (this.fileExists(requestToProjectPathname)) {
                // request is to project file which exists, skip it
                if (requestToProjectPathname === requestToPathname) {
                    callback();
                    return;
                }

                resolveRequest(PROJECT);
                return;
            }

            const requestToFallbackPathname = path.join(this.options.fallbackRoot, requestToRelativePathname);

            if (this.fileExists(requestToFallbackPathname)) {
                if (requestToFallbackPathname === requestToPathname) {
                    callback();
                    return;
                }

                resolveRequest(FALLBACK);
                return;
            }

            callback();
        });
    }
}

// TODO: remove options
FallbackPlugin.defaultOptions = {
    fallbackRoot: path.resolve(require.resolve('@scandipwa/scandipwa/src/index.js'), '../..'),
    projectRoot: process.cwd()
};

module.exports = FallbackPlugin;
