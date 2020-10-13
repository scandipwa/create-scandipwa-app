const { execAsync } = require("./exec-async")

const usingLinuxDistro = async (distroName, version = '') => {
    const res = (await execAsync('lsb_release -d')).toLowerCase()

    return res.includes(distroName.toLowerCase())
        && version
        && Array.isArray(version)
            ? version.some(v => res.includes(v.toLowerCase()))
            : res.includes(version.toLowerCase())
}


module.exports = usingLinuxDistro