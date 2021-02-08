declare module '@scandipwa/scandipwa-dev-utils/parent-theme' {
    export function getParentTheme(pathname: string): string;
    export function getParentThemeSources(pathname: string): Record<string, string>;
}

declare module '@scandipwa/scandipwa-dev-utils/package-json' {
    export function getPackageJson(pathname: string, context?: string): any;
}