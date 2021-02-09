import * as path from 'path';
import * as fs from 'fs';

import { createNewFileWithContents } from '../util/file';

import { getDefaultExportCode, getExportPathsFromCode, getNamedExportsNames } from './ast-interactions';
import { getFileListForResource, getRelativeResourceDirectory } from './fs-interactions';
import generateNewFileContents from './js-generation';
import { createStyleFile, selectStylesOption } from './scss-generation';

import fixESLint from '../util/eslint';
import { getModuleInformation } from '../util/module';

import { ExportData, SourceType, StylesOption } from '../types/extend-component.types';
import { ILogger, IUserInteraction, ResourceType } from '../types';

const shouldHandleStyles = (resourceType: ResourceType, fileName: string) => {
    if (![ResourceType.Route, ResourceType.Component].includes(resourceType)) {
        return false;
    } 

    if (!fileName.includes('component')) {
        return false;
    }

    return true;
};

const getTargetResourceDirectory = (
    relativeResourceDirectory: string,
    targetModulePath: string,
    sourceModuleType: SourceType,
    sourceModuleName: string
) => {
    // Handle specific folder structure for extensions
    // When overriding @scandipwa/paypal/src/component/Paypal
    // Expected path   src/@scandipwa/paypal/component/PayPal
    if (sourceModuleType === SourceType.Extension) {
        const shortenedRelativeResourceDirectory = relativeResourceDirectory.replace(/^(\.\/)?src\/?/, '');

        return path.join(targetModulePath, 'src', sourceModuleName, shortenedRelativeResourceDirectory);
    }

    return path.join(targetModulePath, relativeResourceDirectory);
}

/**
 * @param resourceType Type of resource to extend
 * @param resourceName Name of resource to extend
 * @param targetModulePath Module to create new resource in
 * @param logger 
 * @param userInteraction 
 */
const extend = async (
    resourceType: ResourceType, 
    resourceName: string,
    targetModulePath: string,
    sourceModulePath: string,
    logger: ILogger,
    userInteraction: IUserInteraction
): Promise<string[]> => {
    const relativeResourceDirectory = getRelativeResourceDirectory(resourceName, resourceType);

    const sourceResourceDirectory = path.join(sourceModulePath, relativeResourceDirectory);

    const { 
        name: sourceModuleName,
        type: sourceModuleType,
        alias: sourceModuleAlias
    } = getModuleInformation(sourceModulePath);

    const targetResourceDirectory = getTargetResourceDirectory(
        relativeResourceDirectory,
        targetModulePath,
        sourceModuleType,
        sourceModuleName
    );

    const sourceFiles = getFileListForResource(resourceType, resourceName, sourceResourceDirectory);

    const createdFiles = await sourceFiles.reduce(
        async (acc: Promise<any>, fileName: string): Promise<string[]> => {
            const createdFiles = await acc;

            const sourceFilePath = path.resolve(sourceResourceDirectory, fileName);
            const newFilePath = path.resolve(targetResourceDirectory, fileName);

            // Prevent overwriting
            if (fs.existsSync(newFilePath)) {
                logger.warn(`File ${fileName} exists and will not be overwritten`);
                return createdFiles;
            }

            // Parse the code, get exports
            const code = fs.readFileSync(sourceFilePath, 'utf-8');
            const exportsPaths = getExportPathsFromCode(code);
            const namedExportsData = getNamedExportsNames(exportsPaths);

            // No named exports => nothing to extend
            if (!namedExportsData.length) {
                const [, postfix] = fileName.split('.');

                logger.warn(`No named exports were found in ${postfix}, continuing.`);
                return createdFiles;
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

                // If selected option is "keep styles" => skip style creation
                if (stylesOption !== StylesOption.keep) {
                    const styleFilePath = createStyleFile(
                        resourceName, 
                        targetResourceDirectory,
                        stylesOption,
                        logger
                    );

                    createdFiles.push(styleFilePath);
                }
            }

            // Handle not extending anything in the file
            if (!chosenExports.length) { 
                return createdFiles; 
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
                chosenStylesOption: stylesOption!,
                relativeResourceDirectory,
                sourceModuleName,
                sourceModuleType,
                sourceModuleAlias
            });
            
            // Attempt actual file creation
            const fileIsCreated = createNewFileWithContents(newFilePath, newFileContents, logger);

            // If creation successful => add to the created list
            if (fileIsCreated) {
                return createdFiles.concat(newFilePath);
            }

            return createdFiles;
        }, Promise.resolve([])
    );

    // Prettify!
    fixESLint(createdFiles);

    return createdFiles;
}

export default extend;