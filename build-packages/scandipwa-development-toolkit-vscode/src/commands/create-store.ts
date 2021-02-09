import * as vscode from 'vscode';
import * as path from 'path';
import { openFile, getWorkspacePath } from '../util/file';
const { validateName } = require('../util/validation');
const { createNewFileFromTemplate, checkForFolderAndCreate } = require('../util/file');

export const extensionRoot = path.resolve(__dirname, '..', '..', 'src');

const getFileMap = (dispatcherType: string | boolean) => ({
    'action.js': 'templates/action.js',
    'dispatcher.js': `templates/${dispatcherType}.js`,
    'reducer.js': 'templates/reducer.js'
});

export default async () => {
    const pathToSourceFolder = 'src/store';

    const storeName = await vscode.window.showInputBox({
        placeHolder: 'MyStore',
        prompt: 'Enter store name',
        validateInput: validateName
    });

    if (!storeName) {
        vscode.window.showErrorMessage('Store name is required!');
        return;
    }

    const dispatcherType = (await vscode.window.showQuickPick(
        [
            { label: 'Query dispatcher', target: 'dispatcher-query' },
            { label: 'Regular dispatcher', target: 'dispatcher-regular' },
            { label: 'No dispatcher', target: false },
        ],
        {
            placeHolder: 'Do you need a dispatcher?',
            canPickMany: false
        }
    ));

    if (!dispatcherType) {
        vscode.window.showErrorMessage('Dispatcher type should be selected');
        return;
    }

    checkForFolderAndCreate(pathToSourceFolder);
    checkForFolderAndCreate(`${pathToSourceFolder}/${storeName}`);

    let lastCreatedFile = '';
    Object.entries(getFileMap(dispatcherType.target))
        .filter(([postfix]) => dispatcherType.target ? true : !postfix.includes('dispatcher'))
        .forEach(
            ([postfix, src]) => {
                createNewFileFromTemplate(
                    path.join(extensionRoot, src),
                    `${pathToSourceFolder}/${storeName}/${storeName}.${postfix}`,
                    /Placeholder/g,
                    storeName
                );

                lastCreatedFile = `${pathToSourceFolder}/${storeName}/${storeName}.${postfix}`;
            }
        );

    if (lastCreatedFile) {
        openFile(path.resolve(
            getWorkspacePath(),
            lastCreatedFile
        ));
    }
};
