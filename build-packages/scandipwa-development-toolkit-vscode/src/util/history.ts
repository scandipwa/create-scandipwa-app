import * as vscode from 'vscode';
import ContextManager from './managers/context';
import { 
    SKIP as skipSymbol,
    NONE as noneSymbol,
    HALT as haltSymbol
} from './cwd/keys';
import UI from './ui';

export const getStorage = <T>(storageKey: string, defaultValue?: any): T => {
    const context = ContextManager.getInstance().getContext();

    return context.globalState.get(storageKey, defaultValue);
}

/**
 * Returns false if SKIP
 * Returns null if NONE
 * Returns value if value 
 */
export const proposeFromHistory = async (
    storageKey: string,
    message: string,
    noneOption?: string,
    isSkippable?: boolean
): Promise<string | Symbol | null> => {
    const targetHistory = getStorage<string>(storageKey, []);
    
    // Handle no history
    if (!targetHistory.length) {
        return null;
    }

    // Additional options initialization
    const NONE = noneOption || 'None of the above';
    const SKIP = 'Skip';

    // Additional options addition
    const selectOptions = [...targetHistory];
    selectOptions.push(NONE);
    if (isSkippable) {
        selectOptions.unshift(SKIP);
    }

    // Attempt to serve option from the history
    const resultFromHistory = await UI.singleSelect<string>(message, selectOptions);

    if (resultFromHistory === null) {
        return haltSymbol;
    }

    // Handle "None from the above"
    if (resultFromHistory === NONE) {
        return noneSymbol;
    }

    // Handle skip option selected
    if (resultFromHistory === SKIP) {
        return skipSymbol;
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