const fs = require('fs');

const INDENTATION = 4;

const writeJson = (pathname, json) => {
    fs.writeFileSync(
        pathname,
        JSON.stringify(json, undefined, INDENTATION)
    );
};

module.exports = writeJson;
