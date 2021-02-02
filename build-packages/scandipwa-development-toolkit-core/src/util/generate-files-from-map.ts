import * as path from 'path';
import { createNewFileFromTemplate, ensureDirectory } from './file';

const extensionRoot = path.resolve(__dirname, '..', '..');

const getIsNested = (resourceType: ResourceType) => resourceType !== ResourceType.Query;

/**
 * Generate files from the filemap
 * Returns relative paths to the created files
 * 
 * @param fileMap 
 * @param options 
 * @returns {string[]}
 */
const generateFilesFromMap = (
    fileMap: FileMap, 
    resourceName: string, 
    resourceType: ResourceType, 
    openFile?: FileOpenCallback
): string[] => {
    // Ensure that "head" directory is present, e.g. src/component or src/route etc.
    const resourceTypeDirectory = path.join('src', resourceType);
    ensureDirectory(resourceTypeDirectory);

    // Ensure that the resource's "personal" directory is present, e.g. src/component/AddToCart
    const isNested = getIsNested(resourceType);
    if (isNested) {
        const resourceNameDirectory = path.join(resourceTypeDirectory, resourceName);
        ensureDirectory(resourceNameDirectory);
    }

    // Process entry point
    const createdFiles: string[] = Object.entries(fileMap).reduce(
        (createdFiles, [postfix, templateName]) => {
            // Handle skippable entries
            if (!templateName || !postfix) {
                return createdFiles;
            }

            // Calculate the template path
            const templatePath = path.join(extensionRoot, templateName);

            // Index.js is not a postfix, it should be handled differently
            const newFileName = postfix === 'index.js' && 'index.js' 
                || `${resourceName}.${postfix}`;

            // Calculate the new file path
            const newFilePath = path.join(
                resourceType, 
                // Additional directory if it should be there (e.g. if not Query)
                isNested ? resourceName : '',
                newFileName
            );

            // Create a new file
            createNewFileFromTemplate(
                templatePath,
                newFilePath,
                /Placeholder/g,
                resourceName
            );

            // Preserve path to the new file
            return createdFiles.concat(newFilePath);
        },
        [] as string[]
    );

    if (openFile && createdFiles.length) {
        openFile(createdFiles.pop()!);
    }

    return createdFiles;
}

export default generateFilesFromMap;