export enum ResourceType {
    Route = 'Route',
    Component = 'Component',
    Store = 'Store',
    Query = 'Query'
}

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

export type ComponentResourceParams = {
    containerFeatures: string[]
};

export type StoreResourceParams = {
    dispatcherType: DispatcherType
}

export type ResourceParams = ComponentResourceParams | StoreResourceParams;