const path = require('path');
const logger = require('./logger');

const isTheme = (pathname, quiet = false) => {
    const packageJson = require(`${pathname}/package.json`);
    const { scandipwa: { type } = {} } = packageJson;
    const isTheme = type === 'theme';

    if (quiet || isTheme) {
        // Always simply return, if it is quiet, or if the validation passed
        return isTheme;
    }

    logger.error(
        `Unable to determine if ${ logger.style.file(pathname) } is a ScandiPWA theme.`,
        'The folder is considered a theme, if:',
        `- it contains ${ logger.style.misc('package.json') } file`,
        `- ${ logger.style.misc('package.json') } has a field ${ logger.style.misc('scandipwa.type') }`,
        `- Field ${ logger.style.misc('scandipwa.type') } value must be equal to ${ logger.style.misc('theme') }`,
    );

    return false;
};

module.exports = isTheme;