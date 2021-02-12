import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const isScandipwaModule = (
    pathname: string, 
    includeTypes?: string[]
): boolean => {
    const { 
        scandipwa: { 
            type = undefined
        } = {} 
    } = require(path.join(pathname, 'package.json'));

    if (!type) {
        return false;
    }

    if (includeTypes?.length && !includeTypes?.includes(type)) {
        return false;
    }

    return true;
}

const getScandipwaModulesOfCwd = (pathname: string): string[] => {
    const localModules = path.join(pathname, 'packages');
    const localModulesDirs = fs.readdirSync(localModules).filter(
        (entry) => fs.lstatSync(path.join(localModules, entry)).isDirectory()
    );

    const unscopedModules = localModulesDirs.filter(
        (dirname) => fs.existsSync(path.join(localModules, dirname, 'package.json'))
    );

    const scopes = localModulesDirs.filter((dirname) => !unscopedModules.includes(dirname));

    const scopedModules = scopes.reduce(
        (modules, scope) => {
            const scopePath = path.join(localModules, scope);
            const scopeContents = fs.readdirSync(scopePath);
            const scopeModuleNames = scopeContents.filter(
                dirname => fs.existsSync(path.join(scopePath, dirname, 'package.json'))
            );

            const scopeModuleRelativePaths = scopeModuleNames.map(
                (scopeModuleName) => path.join(scope, scopeModuleName)
            )

            return modules.concat(scopeModuleRelativePaths);
        },
        [] as string[]
    );

    const absolutize = (module: string): string => path.resolve(localModules, module);

    const childModules = [
        ...unscopedModules.map(absolutize),
        ...scopedModules.map(absolutize)
    ]

    // Check if the requested pathname is a module itself
    const additionalModules = [];
    if (isScandipwaModule(pathname, ['theme', 'extension'])) {
        additionalModules.push(pathname);
    }

    return [
        ...childModules,
        ...additionalModules
    ];
};

export const getScandipwaModulesOfWorkspace = (): string[] => {
    const openDirectories = vscode.workspace.workspaceFolders;

    if (!openDirectories) {
        return [];
    }

    return openDirectories.reduce(
        (modules, dir) => modules.concat(getScandipwaModulesOfCwd(dir.uri.fsPath)),
        [] as string[]
    );
}
