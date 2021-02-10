import * as webpack from 'webpack';

export default class FallbackPlugin {
    static getFallbackPathname(pathname: string): string;

    getSourceIndex(pathname: string): number;

    getRelativePathname(pathname: string): string;

    fileExists(pathname: string): boolean;

    getBelongingExtension(pathname: string): string;

    getIsFallbackNeeded(pathname: string): boolean;

    getRequestToPathname(request: any): string;

    getRequestFromPathname(request: any): string;

    apply(resolver: any): void;
}
