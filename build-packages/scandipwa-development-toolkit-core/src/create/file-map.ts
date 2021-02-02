/**
 * Generate a container template name from the supplied container features
 */
const getContainerTemplateName = (containerFeatures: string[]) => {
    if (!containerFeatures.length) {
        return null;
    }

    return ['container', ...containerFeatures].join('-').concat('.js');
}

/**
 * Map for Components/Routes
 */
const getComponentMap = ({ 
    containerFeatures = [] 
}: ComponentResourceParams) => ({
    'component.js': 'component.js',
    'style.scss': 'stylesheet.scss',
    'index.js': containerFeatures.length ? 'index-container.js' : 'index.js',
    'container.js': getContainerTemplateName(containerFeatures),
});

/**
 * Map for Store
 */
const getStoreMap = ({ 
    dispatcherType = DispatcherType.NoDispatcher 
}: StoreResourceParams) => ({
    'action.js': 'action.js',
    'dispatcher.js': dispatcherType === DispatcherType.NoDispatcher ? null : `${dispatcherType}.js`,
    'reducer.js': 'reducer.js'
});

/**
 * Map for Query
 */
const getQueryMap = () => ({
    'query.js': 'query.js'
});

const mapMap: Record<ResourceType, (params: any) => FileMap> = {
    [ResourceType.Component]: getComponentMap,
    [ResourceType.Route]: getComponentMap,
    [ResourceType.Store]: getStoreMap,
    [ResourceType.Query]: getQueryMap
};

/**
 * Map of templates to use
 */
const getFileMap = (resourceType: ResourceType, resourceParams: ResourceParams) => mapMap[resourceType](resourceParams);

export default getFileMap;