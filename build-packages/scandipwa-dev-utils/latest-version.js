const https = require('https');

const getLatestVersion = (packageName) => new Promise((resolve, reject) => {
    https
        .get(
            `https://registry.npmjs.org/-/package/${packageName}/dist-tags`,
            (res) => {
                if (res.statusCode === 200) {
                    let body = '';
                    res.on('data', (data) => {
                        body += data;
                    });
                    res.on('end', () => {
                        resolve(JSON.parse(body).latest);
                    });
                } else {
                    reject();
                }
            }
        )
        .on('error', () => {
            reject();
        });
});

module.exports = getLatestVersion;
