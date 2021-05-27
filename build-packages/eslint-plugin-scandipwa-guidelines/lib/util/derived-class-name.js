const { constructMessage } = require("./messages.js");

const { getNamePartsFromFilename } = require("./path");

function withCapitalizedInitial(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function shouldClassNameBeEnforced(filename) {
    const parts = getNamePartsFromFilename(filename);
    return parts.length > 1;
}

function getExpectedClassNameFromFilename(filename) {
    const parts = getNamePartsFromFilename(filename);

    if (parts.length > 1) {
        const [baseName, type] = parts;
        return withCapitalizedInitial(baseName) + withCapitalizedInitial(type);
    }

    const [baseName] = parts;
    return withCapitalizedInitial(baseName);
}

module.exports = {
    shouldClassNameBeEnforced,
    getExpectedClassNameFromFilename,
};
