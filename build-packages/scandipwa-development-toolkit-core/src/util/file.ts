// TODO remove
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export const getWorkspacePath = () : string => {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
};

/**
 * Make sure the extension is executed in ScandiPWA working directory
 */
export const validateScandiPWA = () => {
    const workspaceFolders = vscode.workspace.workspaceFolders || [];

    if (!workspaceFolders?.length) {
        return false;
    }

    return true;
};

export const ensureDirectory = (name: string) => {
    const dirName = path.resolve(getWorkspacePath(), name);

    fs.ensureDirSync(dirName);
};

export const createNewFileFromTemplate = async (src: string, dest: string, pattern: RegExp, name: string) : Promise<void> => {
    if (!src || !dest || !name) {
        return;
    }
    const data = await fs.readFileSync(src, 'utf8');
    const content = data.replace(pattern, name);
    const destFile = `${getWorkspacePath()}/${dest}`;

    if (fs.existsSync(destFile)) {
        vscode.window.showInformationMessage(`File ${destFile} exists and will not be overwritten`);
        return;
    }
    await fs.writeFileSync(destFile, content);
};

/**
 * Get path to corresponding (src/<this>) folder
 * @param pathToSourceFolder
 */
export const getSourcePath = (pathToSourceFolder: string) : string => {
    const sourcePath : string = vscode.workspace.getConfiguration().get('scandipwa.sourcePath') || '';
    return path.join(getWorkspacePath(), sourcePath, pathToSourceFolder);
};

/**
 * Create a new file and fill it with given contents
 * @param newFilePath
 * @param contents
 */
export const createNewFileWithContents = async (newFilePath: string, contents: string) => {
    ensureDirectory(path.dirname(newFilePath));

    // Prevent overwrites
    if (fs.existsSync(newFilePath)) {
        return;
    }

    // Create the file
    fs.writeFile(
        newFilePath,
        contents,
        console.error
    );
};
