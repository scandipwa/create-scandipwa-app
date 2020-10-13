const packageExists = require('./package-exists');

const getMissingPackages = async (osPackages) => {
    const packages = await Promise.allSettled(osPackages.map(packageExists));
    const missingPackages = packages
        .filter(({ status }) => status === 'rejected')
        .map(({ reason }) => reason)

    return missingPackages
}

module.exports = getMissingPackages;
