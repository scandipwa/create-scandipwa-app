const getos = require('getos');

const getOs = () => new Promise((resolve, reject) => getos((err, os) => (err ? reject(err) : resolve(os))));

const osPlatform = async () => {
    const os = await getOs();

    return os;
};

module.exports = osPlatform;
