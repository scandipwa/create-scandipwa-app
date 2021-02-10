type LoggerStyle = {
    file: (text: string) => string
};

export interface ILogger {
    warn(...messages: string[]): void;
    error(...messages: string[]): void;

    style?: LoggerStyle
}

export type EnquiryOption<Y> = { displayName: string, value: Y };

export interface IUserInteraction {
    singleSelect<T>(
        question: string,
        selectOptions: EnquiryOption<T>[]
    ): Promise<T>;

    multiSelect<T>(
        question: string,
        selectOptions: EnquiryOption<T>[]
    ): Promise<T[]>;

    yesNo(question: string): Promise<boolean>;
}


export type ReplacementInstruction = {
    pattern: RegExp | string,
    replacement: string
};
