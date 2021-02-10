import * as vscode from 'vscode';

/**
 * This catches all the potential errors that are uncaught by callback
 * And notifies the user about it without extra information like trace
 * 
 * @param {function} callback
 */
export const handlePossibleError = (callback: Function | Promise<Function>) => async () => {
    try {
        (await callback)()
    } catch ({ message }) {
        const processedMessage = [
            'Something went wrong!',
            'Please, provide a screenshot with the error below to the ScandiPWA developer team!',
            message
        ].join('\n');

        vscode.window.showErrorMessage(processedMessage);
    }
}