import * as vscode from 'vscode';

import { proposeFromHistory, unshiftUniqueToHistory } from '../history';
import { HALT, SKIP } from './keys';
import { isScandipwaModule } from './workspace';
const locateScandipwaModule = require("@scandipwa/scandipwa-dev-utils/locate-scandipwa-module");

export const selectModuleWithHistory = async (
    message: string, 
    historyKey: string,
    skipOption?: string,
    additionalHistoryEntries?: string[],
    allowedModuleTypes?: string[]
): Promise<string | undefined | null> => {
    const selectedFromHistory = await proposeFromHistory(
        historyKey, 
        message, 
        undefined, 
        skipOption,
        additionalHistoryEntries
    );

    // Handle selection halted
    if (selectedFromHistory === HALT) {
        return null;
    }

    // Handle skip option selected
    if (skipOption && selectedFromHistory === SKIP) {
        return undefined;
    }

    // Handle selected one of previously selected ones
    if (typeof selectedFromHistory === 'string') {
        unshiftUniqueToHistory(historyKey, selectedFromHistory);
        return locateScandipwaModule(selectedFromHistory);
    }

    // Initialize for non-mac
    const options: vscode.OpenDialogOptions = {
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        title: message
    };

    // On Mac, open window does not have a title
    if (process.platform === 'darwin') {
        options.openLabel = message;
    }

    // Provide selection with FS
    const selectedDirectories = await vscode.window.showOpenDialog(options);

    // Handle not selecting anything
    if (!selectedDirectories?.length) {
        return undefined;
    }

    // Preserve the selected value
    const targetDirectory = locateScandipwaModule(selectedDirectories[0].fsPath);
    if (allowedModuleTypes && !isScandipwaModule(targetDirectory, allowedModuleTypes)) {
        throw new Error('Selected module\'s type is not allowed for this action!');
    }

    unshiftUniqueToHistory(historyKey, targetDirectory);

    return targetDirectory;
};