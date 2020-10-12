const packageExists = require('./package-exists');

const getMissingPackages = async (packages) => {
    const packages = await Promise.allSettled(packages.map(packageExists));
    const missingPackages = packages
        .filter(({ status }) => status === 'rejected')
        .map(({ reason }) => reason)

    return missingPackages
}

module.exports = getMissingPackages;
