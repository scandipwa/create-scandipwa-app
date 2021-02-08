declare module '@scandipwa/scandipwa-dev-utils/parent-theme' {
    export function getParentTheme(pathname: string): string;
    export function getParentThemeSources(pathname: string): Record<string, string>;
}