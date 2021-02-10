import * as vscode from 'vscode';

import { 
    ComponentResourceParams, 
    ContainerFeatures, 
    DispatcherType, 
    ResourceParams, 
    ResourceType, 
    StoreResourceParams 
} from "@scandipwa/scandipwa-development-toolkit-core";

import UI from '../util/ui';

const componentParamGetter = async () => {
    const containerFeaturesChoice = await UI.multiSelect(
        'Select container features',
        [{
            displayName: 'Contains business logic',
            value: 'logic'
        },{
            displayName: 'Connected to the global state',
            value: 'state'
        }]
    );

    const containerFeatures: ContainerFeatures = {
        logic: containerFeaturesChoice.includes('logic'),
        state: containerFeaturesChoice.includes('state')
    }

    const componentResourceParams: ComponentResourceParams = { 
        containerFeatures 
    };

    return componentResourceParams;
}

const storeParamGetter = async () => {
    const dispatcherType = await UI.singleSelect(
        'Select dispatcher type',
        [{
            displayName: 'No dispatcher',
            value: DispatcherType.NoDispatcher
        }, {
            displayName: 'Regular dispatcher',
            value: DispatcherType.RegularDispatcher
        }, {
            displayName: 'Query dispatcher',
            value: DispatcherType.QueryDispatcher
        }]
    )

    const storeResourceParams: StoreResourceParams = {
        dispatcherType
    };

    return storeResourceParams;
}

const getterMap: Record<ResourceType, () => ResourceParams> = {
    [ResourceType.Component]: componentParamGetter,
    [ResourceType.Route]: componentParamGetter,
    [ResourceType.Store]: storeParamGetter,
    [ResourceType.Query]: () => ({})
}

const getCommonResourceParams = async (resourceType: ResourceType) => {
    const resourceName = await vscode.window.showInputBox({ 
        placeHolder: `Name of the ${resourceType} to create` 
    });

    if (!resourceName) {
        throw new Error('Supply resource name to create a resource!');
    }

    return { resourceName };
}

export const getResourceParams = async (resourceType: ResourceType): Promise<ResourceParams & {resourceName: string}> => {
    const commonResourceParams = await getCommonResourceParams(resourceType);
    const typeSpecificResourceParams = await getterMap[resourceType]();

    return {
        resourceName: commonResourceParams.resourceName,
        ...typeSpecificResourceParams
    };
}