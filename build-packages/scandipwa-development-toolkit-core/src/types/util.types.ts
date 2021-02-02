export interface ILogger {
    warn(message: string): void;
    error(message: string): void;
}

export type EnquiryOption<Y> = { displayName: string, value: Y } | string;

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