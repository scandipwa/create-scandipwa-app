import * as fs from 'fs';
import * as path from 'path';

import { ResourceType } from "../types";
import { getSourcePath } from '../util/file';

/**
 * Resource = one component/query/store/etc.
 * Resource file = file belonging to it, e.g. for component it'll be:
 * [component, container, style]
 * index.js files are excluded
 */
export const getFileListForResource = (
    extendableType: ResourceType,
    extendableName: string,
    resourceDirectory: string
): Array<string> => {
    if ([ResourceType.Query].includes(extendableType)) {
        return [`${extendableName}.query.js`];
    }

    if ([ResourceType.Component, ResourceType.Route, ResourceType.Store].includes(extendableType)) {
        return fs.readdirSync(resourceDirectory).filter(
            fileName => fileName.match(/\.js$/) && fileName !== 'index.js'
        );
    }

    throw Error('Unexpected extendable type!');
}

/**
 * Builds a path to the directory of extendable files
 */
export const getResourceDirectory = (
    resourceName: string, 
    resourceType: ResourceType,
    resourceTypeDirectory: string
) => {
    if ([
        ResourceType.Component, 
        ResourceType.Route, 
        ResourceType.Store
    ].includes(resourceType)) {
        return path.join(getSourcePath(resourceTypeDirectory), resourceName);
    }

    return getSourcePath(resourceTypeDirectory);
}