const https = require('https');

const getLatestVersion = (package) => {
    return new Promise((resolve, reject) => {
        https
            .get(
                `https://registry.npmjs.org/-/package/${package}/dist-tags`,
                res => {
                    if (res.statusCode === 200) {
                        let body = '';
                        res.on('data', data => (body += data));
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
}

module.exports = getLatestVersion;