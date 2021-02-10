import * as vscode from 'vscode';
import ContextManager from '../managers/context';

export const getStorage = <T>(storageKey: string, defaultValue?: any): T => {
    const context = ContextManager.getInstance().getContext();

    return context.globalState.get(storageKey, defaultValue);
}

export const proposeFromHistory = async (
    storageKey: string,
    message: string,
    noneOption?: string
) => {
    const targetHistory = getStorage<string>(storageKey, []);
    
    // Handle no history
    if (!targetHistory.length) {
        return null;
    }
    
    // Attempt to serve option from the history
    const NONE = noneOption || 'None of the above';
    const resultFromHistory = await vscode.window.showQuickPick([
        ...targetHistory,
        NONE
    ], {
        canPickMany: false,
        placeHolder: message
    });

    // Handle proposed options not selected
    if (resultFromHistory === NONE) {
        return null;
    }

    // Proposed option has been selected => return
    return resultFromHistory;
}

const updateHistory = <T> (
    storageKey: string, 
    newValue: T, 
    updater: (history: T[], newValue: T) => T[]
) => {
    const context = ContextManager.getInstance().getContext();
    const targetHistory = context.globalState.get<T[]>(storageKey, []);

    const updatedHistory = updater(targetHistory, newValue);

    return context.globalState.update(storageKey, updatedHistory);
}

export const pushToHistory = async <T> (storageKey: string, newValue: T) => {
    return updateHistory<T>(
        storageKey, 
        newValue, 
        (history: T[], newValue: T) => [...history, newValue]
    );
}

export const unshiftToHistory = async <T> (storageKey: string, newValue: T) => {
    return updateHistory<T>(
        storageKey, 
        newValue, 
        (history: T[], newValue: T) => [newValue, ...history]
    );
}

const dedupeHistory = <T> (history: T[]) => [...new Set(history)];

export const unshiftUniqueToHistory = async <T> (storageKey: string, newValue: T) => {
    return updateHistory<T>(
        storageKey, 
        newValue, 
        (history: T[], newValue: T) => dedupeHistory([newValue, ...history])
    );
}

export const pushUniqueToHistory = async <T> (storageKey: string, newValue: T) => {
    return updateHistory<T>(
        storageKey, 
        newValue, 
        (history: T[], newValue: T) => dedupeHistory([...history, newValue])
    );
}