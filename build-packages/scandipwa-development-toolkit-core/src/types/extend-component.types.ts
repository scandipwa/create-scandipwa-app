import {
    ExportNamedDeclaration,
    ExportDefaultDeclaration,
} from '@babel/types';

import { NodePath } from '@babel/traverse';

export type ExportsPaths = Array<
    NodePath<ExportNamedDeclaration> |
    NodePath<ExportDefaultDeclaration>
>;

export enum ExportType {
    class,
    specifier,
    variable,
    not_yet_assigned
}

export interface ExportData {
    name: string,
    type: ExportType
}

export enum ResourceType {
    Route = 'Route',
    Component = 'Component',
    Query = 'Query',
    Store = 'Store'
}

export enum StylesOption {
    extend = 'extend',
    override = 'override',
    keep = 'keep'
}

export interface ISearchedFiles  {
    [key: string]: string
}

export interface FileInformation {
    allExports: ExportData[],
    chosenExports: ExportData[],
    defaultExportCode: string | undefined,
    fileName: string,
    originalCode: string,
    resourceType: ResourceType,
    resourceName: string,
    chosenStylesOption: StylesOption
}