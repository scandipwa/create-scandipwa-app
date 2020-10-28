const fs = require('fs');

const writeJson = (pathname, json) => {
    fs.writeFileSync(
        pathname,
        JSON.stringify(json, undefined, 4)
    );
};

module.exports = writeJson;
