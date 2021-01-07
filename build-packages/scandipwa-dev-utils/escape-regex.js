const escapeRegex = (string) => string
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d');

module.exports = escapeRegex;
