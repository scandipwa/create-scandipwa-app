import * as path from 'path';
import * as fs from 'fs';

import { createNewFileWithContents } from '../util/file';

import { getDefaultExportCode, getExportPathsFromCode, getNamedExportsNames } from './ast-interactions';
import { getFileListForResource, getSourceResourceDirectory } from './fs-interactions';
import generateNewFileContents from './js-generation';
import { handleStyles, selectStylesOption } from './scss-generation';
import extendableDirectoryMap from './extendable-dir-map';

import { ExportData, StylesOption } from '../types/extend-component.types';
import { ILogger, IUserInteraction, ResourceType } from '../types';

const notNestedExtendables = [ResourceType.Query];

const shouldHandleStyles = (resourceType: ResourceType, fileName: string) => {
    if (![ResourceType.Route, ResourceType.Component].includes(resourceType)) {
        return false;
    } 

    if (!fileName.includes('component')) {
        return false;
    }

    return true;
};

/**
 * @param resourceType Type of resource to extend
 * @param resourceName Name of resource to extend
 * @param targetModulePath Module to create new resource in
 * @param logger 
 * @param userInteraction 
 */
const extend = (
    resourceType: ResourceType, 
    resourceName: string,
    targetModulePath: string,
    sourceModulePath: string,
    logger: ILogger,
    userInteraction: IUserInteraction
) => {
    const resourceTypeDirectory = extendableDirectoryMap[resourceType];
    const sourceResourceDirectory = getSourceResourceDirectory(
        resourceName, 
        resourceType, 
        resourceTypeDirectory,
        sourceModulePath
    );

    const sourceFileList = getFileListForResource(resourceType, resourceName, sourceResourceDirectory);

    sourceFileList.reduce(
        async (acc: Promise<any>, fileName: string): Promise<any> => {
            await acc;

            const sourceFilePath = path.resolve(sourceResourceDirectory, fileName);
            const newFilePath = path.resolve(targetModulePath, resourceTypeDirectory, fileName);

            // Prevent overwriting
            if (fs.existsSync(newFilePath)) {
                return logger.warn(`File ${fileName} exists and will not be overwritten`);
            }

            // Parse the code, get exports
            const code = fs.readFileSync(sourceFilePath, 'utf-8');
            const exportsPaths = getExportPathsFromCode(code);
            const namedExportsData = getNamedExportsNames(exportsPaths);

            // No named exports => nothing to extend
            if (!namedExportsData.length) {
                const [, postfix] = fileName.split('.');

                return logger.warn(`No named exports were found in ${postfix}, continuing.`);
            }

            // Get default export code
            const defaultExportCode = getDefaultExportCode(exportsPaths, code);

            // Choose exports to extend
            const chosenExports = await userInteraction.multiSelect<ExportData>(
                `Choose things to extend in ${fileName}`,
                namedExportsData.map(x => ({
                    displayName: x.name,
                    value: x
                }))
            );

            let stylesOption: StylesOption;
            // Handle styles if necessary
            if (shouldHandleStyles(resourceType, fileName)) {
                stylesOption = await selectStylesOption(userInteraction);

                handleStyles(
                    resourceName, 
                    resourceTypeDirectory, 
                    stylesOption, 
                    logger
                );
            }

            // Handle not extending anything in the file
            if (!chosenExports.length) { 
                return; 
            }

            // Generate contents for the new file
            const newFileContents = generateNewFileContents({
                allExports: namedExportsData,
                chosenExports,
                defaultExportCode,
                fileName,
                originalCode: code,
                resourceType: resourceType,
                resourceName: resourceName,
                chosenStylesOption: stylesOption!
            });

            createNewFileWithContents(newFilePath, newFileContents);
        }, Promise.resolve(undefined)
    );
}

export default extend;