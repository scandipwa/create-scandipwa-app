const path = require('path');

const EXTENSION_TYPE = 'extension';
const THEME_TYPE = 'theme';
const MAGENTO_TYPE = 'magento';

const walkDirectoryUp = (pathname, expectedType = false, depth = 0) => {
    if (depth > 6) {
        return {};
    }

    try {
        const { scandipwa: { type } } = require(path.join(pathname, 'package.json'));

        if (expectedType && type !== expectedType) {
            // we throw this to trigger the catch function
            throw new Error('Found type does not match expected one');
        }

        return { type, pathname };
    } catch (e) {
        return walkDirectoryUp(path.join(pathname, '..'), expectedType, depth + 1);
    }
};

module.exports = {
    walkDirectoryUp,
    contextTypes: {
        EXTENSION_TYPE,
        THEME_TYPE,
        MAGENTO_TYPE
    }
};
