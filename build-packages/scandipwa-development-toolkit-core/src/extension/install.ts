const installDeps = require('@scandipwa/scandipwa-dev-utils/install-deps');
const { walkDirectoryUp, contextTypes: { THEME_TYPE } } = require('@scandipwa/scandipwa-dev-utils/get-context');

import { ILogger } from "../types";
import enableExtension from './lib/enable-extension';
import addDependency from './lib/add-dependency';

const installExtension = async (
    packageName: string,
    enable = true,
    targetModule = process.cwd(),
    logger: ILogger
): Promise<true | null> => {
    const { 
        type: context, 
        pathname: contextPathname 
    } = walkDirectoryUp(targetModule, THEME_TYPE);

    if (!context) {
        // make sure we are in ScandiPWA theme context
        logger.error(
            'To create an extension you must be located in ScandiPWA theme directory.',
            `We looked up six folders up starting from ${ logger.style.file(targetModule) }!`,
            `There was no folders containing ${ logger.style.file('package.json') }, where ${ logger.style.misc('scandipwa.type') } field was equal to ${ logger.style.misc('theme') }.`
        );

        return null;
    }

    try {
        // add package as dependency and install sub-dependencies
        await addDependency(contextPathname, packageName);
        await installDeps(contextPathname);
    } catch (e) {
        logger.log(e);

        logger.error(
            `Failed to install ScandiPWA extension in ${ logger.style.file(contextPathname) }.`,
            'See the error log above.'
        );

        return null;
    }

    if (enable) {
        enableExtension(contextPathname, packageName);
    }

    return true;
};

export default installExtension;