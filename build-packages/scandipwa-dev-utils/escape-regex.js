const escapeRegex = (string) => string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
module.exports = escapeRegex;
