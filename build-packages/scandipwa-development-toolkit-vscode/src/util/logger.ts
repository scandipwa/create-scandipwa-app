import { 
	ILogger
} from '@scandipwa/scandipwa-development-toolkit-core';

import * as vscode from 'vscode';

class Logger implements ILogger {
    warn(...messages: string[]) {
        vscode.window.showWarningMessage(messages.join('\n'));
    }
    
    error(...messages: string[]) {
        vscode.window.showErrorMessage(messages.join('\n'));
    }
}

export default new Logger();