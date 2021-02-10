import { IUserInteraction, EnquiryOption } from '@scandipwa/scandipwa-development-toolkit-core';
import * as vscode from 'vscode';

class UI implements IUserInteraction {
    private async select<T>(
        question: string,
        selectOptions: EnquiryOption<T>[],
        isMultiSelect: boolean
    ): Promise<T|null|T[]> {
        if (!selectOptions.length) {
            throw new Error('Select options must have been supplied!');
        }

        const transformedOptions = selectOptions.map(
            ({ displayName, value }) => ({ label: displayName, target: value })
        );

        const selectedOptions = await vscode.window.showQuickPick(
            transformedOptions, 
            {
                placeHolder: question,
                canPickMany: isMultiSelect
            }
        );
        
        if (!selectedOptions && isMultiSelect) {
            return [];
        }

        if (!selectedOptions) {
            return null;
        }

        if (!isMultiSelect) {
            return selectedOptions.target;
        }

        // @ts-ignore
        return selectedOptions.map(
            (option: { label: string, target: T}) => option.target
        );
    }

    singleSelect<T>(
        question: string,
        selectOptions: EnquiryOption<T>[]
    ): Promise<T> {
        return this.select<T>(question, selectOptions, false) as Promise<T>;
    };

    multiSelect<T>(
        question: string,
        selectOptions: EnquiryOption<T>[]
    ): Promise<T[]> {
        return this.select<T>(question, selectOptions, true) as Promise<T[]>;
    };

    async yesNo(question: string): Promise<boolean> {
        const YES = 'Yes';
        const NO = 'No';

        const choice = await vscode.window.showQuickPick([YES, NO], {
            canPickMany: false,
            placeHolder: question
        })

        return choice === YES;
    };

    async input(question: string): Promise<string> {
        const result = await vscode.window.showInputBox({
            prompt: question
        });

        return result || '';
    }
}

export default new UI();