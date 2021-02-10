import * as vscode from 'vscode';

import { proposeFromHistory, unshiftUniqueToHistory } from './history';
import locateScandipwaModule from '@scandipwa/scandipwa-dev-utils/locate-scandipwa-module';

export const selectDirectoryWithHistory = async (message: string, historyKey: string) => {
    const selectedFromHistory = await proposeFromHistory(historyKey, message);

    // Handle selected one of previously selected ones
    if (selectedFromHistory) {
        return locateScandipwaModule(selectedFromHistory);
    }

    // Provide selection with FS
    const selectedDirectories = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        title: message
    });

    // Handle not selecting anything
    if (!selectedDirectories) {
        vscode.window.showErrorMessage('Please, select a directory to create functionality in!');

        return null;
    }

    // Preserve the selected value
    const targetDirectory = locateScandipwaModule(selectedDirectories[0].fsPath);
    unshiftUniqueToHistory(historyKey, targetDirectory);

    return targetDirectory;
};