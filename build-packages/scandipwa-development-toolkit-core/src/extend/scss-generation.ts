import * as path from 'path';

import { ILogger, IUserInteraction, StylesOption } from "../types";
import { createNewFileFromTemplate } from '../util/file';

/**
 * Create style file from template
 */
const createStyleFile = (
    extendableName: string,
    resourceTypeDirectory: string,
    stylesOption: StylesOption,
    logger: ILogger
) => {
    const extensionRoot = path.join(__dirname, '..', '..');

    const templatePath = path.join(extensionRoot, `src', 'templates', 'stylesheet.scss`);
    const targetName = `${extendableName}.style${stylesOption === StylesOption.override ? '.override' : ''}.scss`;
    const targetPath = path.join(
        resourceTypeDirectory,
        extendableName,
        targetName,
    );

    createNewFileFromTemplate(
        templatePath, 
        targetPath, 
        /Placeholder/g, 
        extendableName, 
        logger
    );
};

export const selectStylesOption = (userInteraction: IUserInteraction) => userInteraction.singleSelect(
    'What would you like to do with styles?',
    [{
        displayName: 'Keep',
        value: StylesOption.keep
    },
    {
        displayName: 'Extend',
        value: StylesOption.extend
    },
    {
        displayName: 'Override',
        value: StylesOption.override
    }]
);

/**
 * Handle operations with style files (should be called for components and routes only)
 */
export const handleStyles = async (
    extendableName: string,
    resourceTypeDirectory: string,
    stylesOption: StylesOption,
    logger: ILogger
) => {
    // Keep styles => skip this
    if (stylesOption === StylesOption.keep) {
        return;
    }

    // Create the new file
    createStyleFile(
        extendableName, 
        resourceTypeDirectory, 
        stylesOption, 
        logger
    );
}