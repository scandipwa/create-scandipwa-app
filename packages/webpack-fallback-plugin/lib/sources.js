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

const PROJECT = 'project';
const CORE = 'core';

/**
 * Sources available for ScandiPWA Fallback mechanism
 * @typedef {Object} Sources
 * @property {array} firstEntry - Get the top-level entry (i.e. project)
 * @property {array} lastEntry - Get the least-level entry (i.e. core)
 * @property {array} entries - Array of source entries
 * @property {array} keys - Array of source keys
 * @property {function} regexOf - Function to get regex of project source
 */
const sources = {
    [PROJECT]: process.cwd(),
    [CORE]: path.resolve(require.resolve('@scandipwa/scandipwa/src/index.js'), '../..'),
};

Object.defineProperties(sources, {
    firstEntry: {
        enumerable: false,
        get: () => {
            return Object.keys(sources)[0];
        }
    },
    lastEntry: {
        enumerable: false,
        get: () => {
            return Object.keys(sources)[sources.length - 1];
        }
    },
    entries: {
        enumerable: false,
        get: () => {
            return Object.entries(sources);
        }
    },
    keys: {
        enumerable: false,
        get: () => {
            return Object.keys(sources);
        }
    },
    values: {
        enumerable: false,
        get: () => {
            return Object.values(sources);
        }
    },
    getRegexOf: {
        enumerable: false,
        value: (source) => {
            return new RegExp(`${ path.join(sources[source], 'src') }|${ path.join(sources[source], 'public') }`);
        }
    }
})

module.exports = {
    sources,
    PROJECT,
    CORE
};