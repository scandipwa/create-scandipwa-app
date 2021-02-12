import * as vscode from 'vscode';

import { ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";
import { ActionType } from "../../types";
import UI from '../../util/ui';

export const getResourceName = async (
    resourceType: ResourceType,
    actionType: ActionType
): Promise<string | null> => {
    const resourceName = await UI.input(`Name of the ${resourceType} to ${actionType}`);

    return resourceName;
}