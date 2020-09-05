import * as vscode from 'vscode';

import createQuery from './commands/create-query';
import createStore from './commands/create-store';
import createComponent from './commands/create-component';
import extend from './commands/extender';
import { Extendable } from './types/extend-component.types';
import { validateScandiPWA } from './util/file';

const commandMap = {
	'extension.createNewComponent': createComponent.bind(null, false),
	'extension.createNewRoute': createComponent.bind(null, true),
	'extension.createNewQuery': createQuery,
	'extension.createNewStore': createStore,
	'extension.extendCoreComponent': extend.bind(null, Extendable.component),
	'extension.extendCoreRoute': extend.bind(null, Extendable.route),
	'extension.extendCoreQuery': extend.bind(null, Extendable.query),
	'extension.extendCoreStore': extend.bind(null, Extendable.store),
};

export function activate(context: vscode.ExtensionContext) {
	Object.entries(commandMap).forEach(
		([ name, handler ]) => {
			const disposable = vscode.commands.registerCommand(
				name,
				() => {
					if (validateScandiPWA()) {
						return handler();
					}
					vscode.window.showErrorMessage('ScandiPWA directory is not recognized!');
				}
			);
			context.subscriptions.push(disposable);
		}
	);
}

export function deactivate() {}
