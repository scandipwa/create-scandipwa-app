import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export const getWorkspacePath = () : string => {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
};

export const openFile = (destFile: string) : void => {
    vscode.workspace.openTextDocument(destFile).then(
        (editor: any) => vscode.window.showTextDocument(editor)
    );
};

const getDirContents = (path: string) : string[] => {
    if (!fs.existsSync(path)) {
        return [];
    }
    return fs.readdirSync(path);
};

/**
 * Get path to corresponding (src/<this>) folder
 * @param pathToSourceFolder
 */
export const getSourcePath = (pathToSourceFolder: string) : string => {
    const sourcePath : string = vscode.workspace.getConfiguration().get('scandipwa.sourcePath') || '';
    return path.join(getWorkspacePath(), sourcePath, pathToSourceFolder);
};

export const showSourceDirectoryContentInSelect = async (pathToSourceFolder: string, placeHolder: string) => {
    const componentNames = await getDirContents(getSourcePath(pathToSourceFolder))
        .map(directoryEntry => {
            if (pathToSourceFolder.includes('query')) {
                return directoryEntry.split('.')[0];
            }

            return directoryEntry;
        })
        .filter(x => x !== ('index.js'));

    return await vscode.window.showQuickPick(
        componentNames.map(label => ({ label })),
        { placeHolder }
    );
};
