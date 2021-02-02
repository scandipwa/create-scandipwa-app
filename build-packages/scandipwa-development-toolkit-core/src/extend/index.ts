import * as path from 'path';
import * as fs from 'fs';

import { getWorkspacePath, createNewFileWithContents } from '../util/file';

import { getDefaultExportCode, getExportPathsFromCode, getNamedExportsNames } from './ast-interactions';
import { getFileListForResource, getResourceDirectory } from './fs-interactions';
import generateNewFileContents from './js-generation';
import { handleStyles, selectStylesOption } from './scss-generation';
import extendableDirectoryMap from './extendable-dir-map';

import { ExportData, ResourceType, StylesOption } from '../types/extend-component.types';
import { ILogger, IUserInteraction } from '../types';

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

const process = (
    resourceType: ResourceType, 
    resourceName: string, 
    logger: ILogger,
    userInteraction: IUserInteraction
) => {
    const resourceTypeDirectory = extendableDirectoryMap[resourceType];
    const resourceDirectory = getResourceDirectory(resourceName, resourceType, resourceTypeDirectory);

    getFileListForResource(resourceType, resourceName, resourceDirectory).reduce(
        async (acc: Promise<any>, fileName: string): Promise<any> => {
            await acc;

            const fullSourcePath = path.resolve(resourceDirectory, fileName);
            const newFilePath = path.resolve(
                getWorkspacePath(),
                resourceTypeDirectory,
                // Handle extendables like query, which don't have one extra directory
                !notNestedExtendables.includes(resourceType) ? resourceName : '',
                fileName
            );

            // Prevent overwriting
            if (fs.existsSync(newFilePath)) {
                throw new Error(`File ${fileName} exists and will not be overwritten`);
            }

            // Parse the code, get exports
            const code = fs.readFileSync(fullSourcePath, 'utf-8');
            const exportsPaths = getExportPathsFromCode(code);
            const namedExportsData = getNamedExportsNames(exportsPaths);

            // No named exports => nothing to extend
            if (!namedExportsData.length) {
                const [, postfix] = fileName.split('.');

                logger.warn(`No named exports were found in ${postfix}, continuing.`);
                return;
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

                handleStyles(resourceName, resourceTypeDirectory, stylesOption);
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