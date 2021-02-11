const { getPackageJson } = require('./package-json');
const logger = require('./logger');
const getPackagePath = require('./package-path');

const getParentTheme = (pathname) => {
    const {
        scandipwa: {
            parentTheme
        } = {}
    } = getPackageJson(pathname);

    return parentTheme;
};

const getParentThemePaths = (pathname = process.cwd(), rootTheme = pathname) => {
    const parentThemePackage = getParentTheme(pathname);

    if (!parentThemePackage) {
        return [];
    }

    const parentThemePathname = getPackagePath(parentThemePackage, rootTheme);

    return [
        parentThemePathname,
        ...getParentThemePaths(parentThemePathname, rootTheme)
    ];
};

const getParentThemeSources = () => {
    const parentThemeList = getParentThemePaths();

    return parentThemeList.reduce((acc, pathname) => {
        const {
            name,
            scandipwa: {
                themeAlias
            } = {}
        } = getPackageJson(pathname);

        if (!themeAlias) {
            // Prevent themes without a name
            // TODO: fallback to package name

            logger.error(
                `The parent theme registered in package ${ logger.style.misc(name) } is invalid.`,
                `The required field ${ logger.style.code('scandipwa.themeAlias') } is missing in ${ logger.style.file('package.json') }`
            );

            process.exit(1);
        }

        if (acc[themeAlias]) {
            // Prevent similar theme names

            const {
                name: sameNamePackage
            } = getPackageJson(acc[themeAlias]);

            logger.error(
                `The parent theme registered in package ${ logger.style.misc(name) } is invalid.`,
                `The required field ${ logger.style.code('scandipwa.themeName') } contains invalid value.`,
                `The theme with the name ${ logger.style.misc(themeAlias) } already exist.`,
                `It was previously declared in the ${ logger.style.misc(sameNamePackage) } package.`
            );

            process.exit(1);
        }

        return {
            ...acc,
            [themeAlias]: pathname
        };
    }, {});
};

const getParentThemeAliases = () => {
    const parentThemeSources = getParentThemeSources();

    // Use theme alias as a key
    return Object.keys(parentThemeSources).reduce((acc, key) => ({
        ...acc,
        [key]: key
    }), {});
};

module.exports = {
    getParentTheme,
    getParentThemePaths,
    getParentThemeSources,
    getParentThemeAliases
};
