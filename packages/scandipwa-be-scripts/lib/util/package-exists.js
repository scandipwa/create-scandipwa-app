const { execAsyncBool } = require('./exec-async');

const packageExists = (packageName) => new Promise((res, rej) => {
    execAsyncBool(
        `(dpkg -s ${packageName} | grep Status && echo 0 || echo 1)`
    )
        .then(() => res())
        .catch(() => rej(packageName));
});

module.exports = packageExists;
