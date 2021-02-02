enum ResourceType {
    Route = 'route',
    Component = 'component',
    Store = 'store',
    Query = 'query'
}

type FileMap = Record<string, string | null>;

type MapGeneratorOptions = {
    resourceType: ResourceType,
    resourceName: string
}

enum DispatcherType {
    QueryDispatcher = 'dispatcher-query',
    RegularDispatcher = 'dispatcher-regular',
    NoDispatcher = 'no-dispatcher'
}

type FileOpenCallback = (filename: string) => void;

type ComponentResourceParams = {
    containerFeatures: string[]
};

type StoreResourceParams = {
    dispatcherType: DispatcherType
}

type ResourceParams = ComponentResourceParams | StoreResourceParams;