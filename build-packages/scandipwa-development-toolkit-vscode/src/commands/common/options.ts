import * as vscode from 'vscode';

import { ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";
import { ActionType } from "../../types";

export const getResourceName = async (
    resourceType: ResourceType,
    actionType: ActionType
) => {
    const resourceName = await vscode.window.showInputBox({ 
        placeHolder: `Name of the ${resourceType} to ${actionType}` 
    });

    if (!resourceName) {
        throw new Error(`Supply a resource name to ${actionType} a resource!`);
    }

    return resourceName;
}