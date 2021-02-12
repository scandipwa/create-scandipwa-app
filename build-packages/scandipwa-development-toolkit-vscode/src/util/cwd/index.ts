import * as vscode from 'vscode';

import { proposeFromHistory, unshiftUniqueToHistory } from '../history';
import { HALT, SKIP } from './keys';
const locateScandipwaModule = require("@scandipwa/scandipwa-dev-utils/locate-scandipwa-module");

export const selectDirectoryWithHistory = async (
    message: string, 
    historyKey: string,
    isSkippable?: boolean
): Promise<string | undefined | null> => {
    const selectedFromHistory = await proposeFromHistory(historyKey, message, undefined, isSkippable);

    // Handle selection halted
    if (selectedFromHistory === HALT) {
        return null;
    }

    // Handle skip option selected
    if (isSkippable && selectedFromHistory === SKIP) {
        return undefined;
    }

    // Handle selected one of previously selected ones
    if (typeof selectedFromHistory === 'string') {
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
    unshiftUniqueToHistory(historyKey, targetDirectory);

    return targetDirectory;
};