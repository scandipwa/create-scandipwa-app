import { ResourceType } from './common.types';

export type FileMap = Record<string, string | null>;

export type MapGeneratorOptions = {
    resourceType: ResourceType,
    resourceName: string
}

export enum DispatcherType {
    QueryDispatcher = 'dispatcher-query',
    RegularDispatcher = 'dispatcher-regular',
    NoDispatcher = 'no-dispatcher'
}

export type FileOpenCallback = (filename: string) => void;

export type ContainerFeatures = {
    logic: boolean,
    state: boolean
};

export type ComponentResourceParams = {
    containerFeatures: ContainerFeatures
};

export type StoreResourceParams = {
    dispatcherType: DispatcherType
}

export type ResourceParams = ComponentResourceParams | StoreResourceParams;