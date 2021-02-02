import * as path from 'path';

import getFileMap from './file-map';

import generateFilesFromMap from '../util/generate-files-from-map';
import validateResourceParams from './validate-resource-params';

export const extensionRoot = path.resolve(__dirname, '..', '..', 'src');

/**
 * Entry: validate input and create files
 */
const create = (
    resourceType: ResourceType, 
    resourceName: string, 
    resourceParams: ResourceParams, 
    openFile?: FileOpenCallback
) => {
    // Validate input data
    const validationErrors = validateResourceParams(resourceName, resourceType, resourceParams);
    if (validationErrors.length) {
        throw new Error(validationErrors.map(({ message }) => message).join(';'));
    }

    // Get map of files to create
    const fileMap = getFileMap(resourceType, resourceParams);

    // Create the files
    return generateFilesFromMap(fileMap, resourceName, resourceType, openFile);
};

export default create;