import * as fs from 'fs';
import * as path from 'path';

import { ResourceType } from "../types";

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
export const getSourceResourceDirectory = (
    resourceName: string, 
    resourceType: ResourceType,
    resourceTypeDirectory: string,
    sourceModulePath: string
) => {
    if ([
        ResourceType.Component, 
        ResourceType.Route, 
        ResourceType.Store
    ].includes(resourceType)) {
        return path.join(sourceModulePath, resourceTypeDirectory, resourceName);
    }

    return path.join(sourceModulePath, resourceTypeDirectory);
}